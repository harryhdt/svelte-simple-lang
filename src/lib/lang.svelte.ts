type ExtractKeys<T> = T extends object
	? {
			[K in keyof T]: T[K] extends string
				? K & string
				: T[K] extends object
					? `${K & string}.${ExtractKeys<T[K]>}`
					: never;
		}[keyof T]
	: never;
type ExtractParams<T extends string> = T extends `${string}{${infer Param}}${infer Rest}`
	? Param | ExtractParams<Rest>
	: never;
type LocaleData = {
	[key: string]: string | LocaleData;
};
type LocaleLoader<Source extends LocaleData> = () => Promise<{ default: Source }>;
type LocaleSource<Source extends LocaleData> = Source | LocaleLoader<Source>;

type TranslationParams<Key extends string> =
	ExtractParams<Key> extends never ? undefined : { [P in ExtractParams<Key>]: string | number };

export type TranslationFn<Source extends LocaleData> = <K extends ExtractKeys<Source>>(
	key: K,
	params?: TranslationParams<K>
) => string;

export type LangInstance<Locales extends string, Source extends LocaleData> = {
	getLocale: () => Locales;
	setLocale: (l: Locales) => Promise<boolean>;
	resetLocale: () => Promise<boolean>;
	setDefaultLocale: (l: Locales) => Promise<boolean>;
	t: TranslationFn<Source>;
	availableLocales: Locales[];
};

type LangProps<Source extends LocaleData, Sources extends Record<string, LocaleSource<Source>>> = {
	defaultLocale: Extract<keyof Sources, string>;
	defaultSource: Source;
	sources: Sources;
	maxCachedLocales?: number;
};

function createLang<
	Source extends LocaleData,
	Sources extends Record<string, LocaleSource<Source>>
>(props: LangProps<Source, Sources>): LangInstance<Extract<keyof Sources, string>, Source> {
	if (!props.defaultLocale) {
		throw new Error('defaultLocale is required');
	}
	if (!props.sources) {
		throw new Error('sources is required');
	}
	if (Object.keys(props.sources).length === 0) {
		throw new Error('sources is required');
	}
	if (!Object.keys(props.sources).includes(props.defaultLocale)) {
		throw new Error(`defaultLocale "${props.defaultLocale}" not found in sources`);
	}

	const sources = props.sources;
	// Validate maxCachedLocales
	if (props.maxCachedLocales !== undefined) {
		if (!Number.isInteger(props.maxCachedLocales) || props.maxCachedLocales < 2) {
			throw new Error(
				'maxCachedLocales must be at least 2 (one for default locale + at least one other locale)'
			);
		}
	}
	const maxCachedLocales = props.maxCachedLocales ?? 5; // Default to 5
	let locale = $state(props.defaultLocale);
	let defaultLocale = props.defaultLocale;
	const loadedLocales = new Map<Extract<keyof Sources, string>, Source>();
	loadedLocales.set(defaultLocale, props.defaultSource);
	let localeChangePromise: Promise<boolean> = Promise.resolve(true);

	// Helper: Evict oldest locale if cache is full (preserving defaultLocale)
	function evictOldestLocaleIfNeeded(newLocale: Extract<keyof Sources, string>) {
		if (loadedLocales.size >= maxCachedLocales && !loadedLocales.has(newLocale)) {
			// Find the oldest (first) locale that isn't the default or the new one
			for (const cachedLocale of loadedLocales.keys()) {
				if (cachedLocale !== defaultLocale && cachedLocale !== newLocale) {
					loadedLocales.delete(cachedLocale);
					break; // Only evict one
				}
			}
		}
	}

	async function loadLocale(l: Extract<keyof Sources, string>): Promise<boolean> {
		try {
			if (loadedLocales.has(l)) {
				const data = loadedLocales.get(l)!;
				loadedLocales.delete(l);
				loadedLocales.set(l, data); // LRU: move to end
				return true;
			}
			if (l === defaultLocale) return true;

			// Evict oldest locale if cache is full
			evictOldestLocaleIfNeeded(l);

			const source = sources[l];
			if (typeof source === 'object') {
				loadedLocales.set(l, source as Source);
				return true;
			}
			const module = await source();
			const data = 'default' in module ? module.default : module;
			loadedLocales.set(l, data as Source);
			return true;
		} catch (error) {
			console.error(`Failed to load locale "${l}":`, error);
			return false;
		}
	}

	const t: TranslationFn<Source> = (key, params) => {
		const data = loadedLocales.get(locale);
		if (!data) {
			console.warn(`Locale "${locale}" not loaded`);
			return key as string;
		}

		let actualKey = key as string;

		// plural handling: support _zero, singular, and _plural forms
		if (params && 'count' in params && params?.count !== undefined) {
			const count = Number(params.count);
			if (isNaN(count)) {
				console.warn(`Invalid count parameter: ${params.count} (expected number)`);
			} else if (count === 0) {
				// Check for zero form first
				const zeroKey = `${actualKey}_zero`;
				if (getNested(data, zeroKey) !== undefined) {
					actualKey = zeroKey;
				}
				// Otherwise falls back to singular form
			} else if (count > 1) {
				// Use plural form for count > 1
				const pluralKey = `${actualKey}_plural`;
				if (getNested(data, pluralKey) !== undefined) {
					actualKey = pluralKey;
				}
			}
			// For count === 1, uses singular form (actualKey unchanged)
		}

		const value = getNested(data, actualKey);

		if (value === undefined) {
			console.warn(`Key "${actualKey}" not found in locale ${locale}`);
			return key as string;
		}

		// Ensure value is string, not nested object
		if (typeof value !== 'string') {
			console.warn(
				`Translation value for key "${actualKey}" must be string, but got ${typeof value}. ` +
					`Did you mean to access a nested key?`
			);
			return key as string;
		}

		let text = value;

		if (params) {
			for (const [paramKey, paramValue] of Object.entries(params)) {
				// Escape regex special characters in parameter name
				const escapedKey = paramKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				text = text.replace(new RegExp(`{${escapedKey}}`, 'g'), String(paramValue));
			}
		}

		return text;
	};

	const api: LangInstance<Extract<keyof Sources, string>, Source> = {
		getLocale: () => locale,

		setLocale: async (l: Extract<keyof Sources, string>) => {
			return (localeChangePromise = localeChangePromise
				.then(async () => {
					if (l === undefined || l === null) return false;
					if (!(l in sources)) {
						console.warn(`Locale "${l.toString()}" not found`);
						return false;
					}
					const success = await loadLocale(l);
					if (!success) return false;
					locale = l;
					return true;
				})
				.catch((error) => {
					console.error(`Unexpected error in setLocale:`, error);
					return false;
				}));
		},

		resetLocale: async () => {
			return (localeChangePromise = localeChangePromise
				.then(async () => {
					const success = await loadLocale(defaultLocale);
					if (success) {
						locale = defaultLocale;
					}
					return success;
				})
				.catch((error) => {
					console.error(`Unexpected error in resetLocale:`, error);
					return false;
				}));
		},

		setDefaultLocale: async (l: Extract<keyof Sources, string>) => {
			return (localeChangePromise = localeChangePromise
				.then(async () => {
					if (l === undefined || l === null) return false;
					if (!(l in sources)) {
						console.warn(`Locale "${l.toString()}" not found`);
						return false;
					}
					const success = await loadLocale(l);
					if (!success) return false;
					locale = l;
					defaultLocale = l;
					return true;
				})
				.catch((error) => {
					console.error(`Unexpected error in setDefaultLocale:`, error);
					return false;
				}));
		},

		t,

		availableLocales: Object.keys(sources) as Extract<keyof Sources, string>[]
	};

	return api;
}

function getNested(obj: LocaleData | undefined, path: string): string | LocaleData | undefined {
	if (!obj) return undefined;
	return path.split('.').reduce<string | LocaleData | undefined>((current, key) => {
		if (typeof current === 'object' && current !== null && key in current) {
			return current[key];
		}
		return undefined;
	}, obj);
}

export default createLang;
