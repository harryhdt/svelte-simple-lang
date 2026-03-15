<script lang="ts">
	import {
		availableLocales,
		getLocale,
		setDefaultLocale,
		setLocale,
		t
	} from '../../../local-lib/i18n.js';
	import type { PageProps } from './$types.js';
	const { data }: PageProps = $props();

	setDefaultLocale(data.lang);

	const toggleLocale = async () => {
		const locale = getLocale();
		const newLocale = locale === 'en' ? 'id' : 'en';
		await setLocale(newLocale);
		// hit api for change user language in database
	};
</script>

<svelte:head>
	<title>Lang: {getLocale()} {t('world')} | Svelte Simple Lang (SSR MODE)</title>
</svelte:head>

<h1>Svelte Simple Lang (SSR MODE)</h1>
<p>i18n for Svelte - <a href="https://github.com/harryhdt/svelte-simple-lang">Docs Github</a></p>
<p>Go to <a href="/">Home</a></p>
<hr style="height: 1px;border: 0; background-color: #ddd;" />
<p>SSR Mode</p>
<p>
	Your lang: {data.lang} <span class="inline-note">it randomly generate for simulate ssr mode</span>
	<br />
	Available locale: {availableLocales.join(', ')}
</p>

<div class="block">
	<pre>{@html `
// src/routes/layout.server.ts
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

	`}</pre>
</div>

<div class="block">
	<pre>{@html `
// +page.svelte
import { availableLocales, getLocale, setLocale, setDefaultLocale, t } from '$lib/lang/i18n.js';
import type { PageProps } from './$types.js';

const { data }: PageProps = $props();

setDefaultLocale(lang);

const toggleLocale = async () => {
	const locale = getLocale();
	const newLocale = locale === 'en' ? 'id' : 'en';
	await setLocale(newLocale);
	// hit api for change user language in database
};
	`}</pre>
</div>

<div class="block">
	<pre>
    {@html `
en.json
{
	"world": "World",
	"hello_{name}": "Hello {name}",
	"you_have_{count}_apple": "You have {count} apple",
	"you_have_{count}_apple_plural": "You have {count} apples",
	"you_have_{count}_item": "You have {count} item"
}


id.json
{
	"world": "Dunia",
	"hello_{name}": "Halo {name}",
	"you_have_{count}_apple": "Kamu punya {count} apel",
	"you_have_{count}_apple_plural": "Kamu punya {count} apel",
	"you_have_{count}_item": "Kamu punya {count} item"
}
    `}
  </pre>
</div>
<br />
<p>Current lang: {getLocale()}</p>
<button type="button" onclick={toggleLocale}> Change Locale </button>
<br /><br />
<div class="block">
	<pre>{@html "<code>{t('world')}</code>"}</pre>
	<p>{t('world')}</p>
</div>

<style>
	.block {
		background-color: #f1f1f1;
		padding: 10px;
		border: 1px solid #ddd;
		margin-bottom: 12px;
		overflow: auto;
	}
	.inline-note {
		display: inline-block;
		padding: 0 3px;
		background-color: rgb(255, 255, 197);
		border: 1px solid #ddd;
		border-radius: 4px;
	}
</style>
