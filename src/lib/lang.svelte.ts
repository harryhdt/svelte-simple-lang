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

const createLang = <
	Locales extends string,
	Sources extends Record<Locales, (() => Promise<{ default: LocaleData }>) | LocaleData>
>(props: {
	defaultLocale: Locales;
	defaultSource: LocaleData;
	sources: Sources;
	maxCachedLocales?: number;
}) => {
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
	const maxCachedLocales = props.maxCachedLocales ?? 5; // Default to 5
	let locale = $state(props.defaultLocale);
	let defaultLocale = props.defaultLocale;
	const loadedLocales = new Map<string, LocaleData>();
	loadedLocales.set(defaultLocale, props.defaultSource);
	let localeChangePromise: Promise<boolean> = Promise.resolve(true);

	// Helper: Evict oldest locale if cache is full (preserving defaultLocale)
	function evictOldestLocaleIfNeeded(newLocale: Locales) {
		if (loadedLocales.size >= maxCachedLocales && !loadedLocales.has(newLocale)) {
			// Find the oldest (first) locale that isn't the default or the new one
			for (const locale of loadedLocales.keys()) {
				if (locale !== defaultLocale && locale !== newLocale) {
					loadedLocales.delete(locale);
					break; // Only evict one
				}
			}
		}
	}

	async function loadLocale(l: Locales): Promise<boolean> {
		try {
			if (loadedLocales.has(l)) return true;
			if (l === defaultLocale) return true;

			// Evict oldest locale if cache is full
			evictOldestLocaleIfNeeded(l);

			if (typeof sources[l] === 'object') {
				loadedLocales.set(l, sources[l] as LocaleData);
				return true;
			}
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const module = await sources[l]();
			const data = 'default' in module ? module.default : module;
			loadedLocales.set(l, data as Record<string, string>);
			return true;
		} catch (error) {
			console.error(`Failed to load locale "${l}":`, error);
			return false;
		}
	}

	return {
		getLocale: () => locale as keyof typeof sources,

		setLocale: async (l: keyof typeof sources) => {
			return (localeChangePromise = localeChangePromise.then(async () => {
				if (l === undefined || l === null) return false;
				if (!sources[l]) {
					console.warn(`Locale "${l.toString()}" not found`);
					return false;
				}
				const success = await loadLocale(l as Locales);
				if (!success) return false;
				locale = l as Locales;
				return true;
			}));
		},

		resetLocale: async () => {
			return (localeChangePromise = localeChangePromise.then(async () => {
				const success = await loadLocale(defaultLocale);
				if (success) {
					locale = defaultLocale;
				}
				return success;
			}));
		},

		setDefaultLocale: async (l: keyof typeof sources) => {
			return (localeChangePromise = localeChangePromise.then(async () => {
				if (l === undefined || l === null) return false;
				if (!sources[l]) {
					console.warn(`Locale "${l.toString()}" not found`);
					return false;
				}
				const success = await loadLocale(l as Locales);
				if (!success) return false;
				locale = l as Locales;
				defaultLocale = l as Locales;
				return true;
			}));
		},

		t: <K extends ExtractKeys<Sources[Locales]>>(
			key: K,
			params?: ExtractParams<K> extends never
				? undefined
				: { [P in ExtractParams<K>]: string | number }
		): string => {
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

			let text = value as string;

			if (params) {
				for (const [paramKey, paramValue] of Object.entries(params)) {
					text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
				}
			}

			return text;
		},

		availableLocales: Object.keys(sources) as (keyof typeof sources)[]
	};
};

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
