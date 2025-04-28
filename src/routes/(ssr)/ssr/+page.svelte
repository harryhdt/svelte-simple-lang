<script lang="ts">
	import { availableLocales, getLocale, setDefaultLocale, setLocale, t } from '$lib/lang/i18n.js';
	import type { PageProps } from './$types.js';
	const { data }: PageProps = $props();

	setDefaultLocale(data.lang);

	const toggleLocale = () => {
		const locale = getLocale();
		const newLocale = locale === 'en' ? 'id' : 'en';
		setLocale(newLocale);
		// hit api for change user language in database
	};
</script>

<svelte:head>
	<title>Lang: {getLocale()} | Svelte Simple Lang (SSR MODE)</title>
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
// src/hooks.server.ts
import { setDefaultLocale } from '$lib/lang/i18n.js';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// const lang = event.request.headers.get('accept-language')?.split(',')[0];
	// random generate for simulate ssr mode locale
	const lang = (Math.random() > 0.5 ? 'id' : 'en') as 'id' | 'en';
	console.log(lang);
	setDefaultLocale(lang);
	return resolve(event);
};

	`}</pre>
</div>

<div class="block">
	<pre>{@html `
// +page.svelte
import { availableLocales, getLocale, setLocale, t } from '$lib/lang/i18n.js';

const toggleLocale = () => {
	const locale = getLocale();
	const newLocale = locale === 'en' ? 'id' : 'en';
	setLocale(newLocale);
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
	}
	.inline-note {
		display: inline-block;
		padding: 0 3px;
		background-color: rgb(255, 255, 197);
		border: 1px solid #ddd;
		border-radius: 4px;
	}
</style>
