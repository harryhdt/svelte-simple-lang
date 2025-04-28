import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async ({ url }) => {
	const params = url.searchParams;
	const paramsLang = params.get('lang') || '';
	// Generate randomly (in a real app, you might use a database to store the locale for each user)
	const lang = (
		['id', 'en'].includes(paramsLang) ? paramsLang : Math.random() > 0.5 ? 'id' : 'en'
	) as 'id' | 'en';
	return {
		lang
	};
};
