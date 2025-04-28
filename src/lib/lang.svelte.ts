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
	let locale = $state(props.defaultLocale);
	let defaultLocale = props.defaultLocale;
	const loadedLocales = new Map<string, LocaleData>();
	loadedLocales.set(defaultLocale, props.defaultSource);

	async function loadLocale(l: Locales) {
		if (loadedLocales.has(l)) return;
		if (l === defaultLocale) return;
		if (typeof sources[l] === 'object') return;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const module = await sources[l]();
		const data = 'default' in module ? module.default : module;
		loadedLocales.set(l, data as Record<string, string>);
	}

	return {
		getLocale: () => locale as keyof typeof sources,

		setLocale: async (l: keyof typeof sources) => {
			if (l === undefined || l === null) return;
			if (!sources[l]) {
				console.warn(`Locale "${l.toString()}" not found`);
				return;
			}
			await loadLocale(l as Locales);
			locale = l as Locales;
		},

		resetLocale: async () => {
			await loadLocale(defaultLocale);
			locale = defaultLocale;
		},

		setDefaultLocale: async (l: keyof typeof sources) => {
			if (l === undefined || l === null) return;
			if (!sources[l]) {
				console.warn(`Locale "${l.toString()}" not found`);
				return;
			}
			await loadLocale(l as Locales);
			locale = l as Locales;
			defaultLocale = l as Locales;
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

			// plural
			if (params && 'count' in params && params?.count !== undefined && Number(params.count) > 1) {
				const pluralKey = `${actualKey}_plural`;
				if (getNested(data, pluralKey)) {
					actualKey = pluralKey;
				}
			}

			const value = getNested(data, actualKey);

			if (!value) {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNested(obj: any, path: string) {
	return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
}

export default createLang;
