import createLang from '$lib/lang.svelte.js';
import id from './id.json' with { type: 'json' };

const i18n = createLang({
	defaultLocale: 'id',
	defaultSource: id,
	sources: {
		id: id,
		en: () => import('./en.json') // optional
	}
});

export const { availableLocales, getLocale, resetLocale, setLocale, setDefaultLocale, t } = i18n;
export default i18n;
