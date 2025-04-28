<script lang="ts">
	import { browser } from '$app/environment';
	import { availableLocales, getLocale, setDefaultLocale, setLocale, t } from '$lib/lang/i18n.js';

	const setup = async () => {
		await setDefaultLocale((localStorage.getItem('locale') as 'en' | 'id') || 'id');
	};

	// Sveltekit wait for browser environment, or you can use export const prerender = false
	if (browser) {
		setup();
	}

	const toggleLocale = async () => {
		const locale = getLocale();
		const newLocale = locale === 'en' ? 'id' : 'en';
		await setLocale(newLocale);
		localStorage.setItem('locale', newLocale);
	};
</script>

<svelte:head>
	<title>Svelte Simple Lang</title>
</svelte:head>

<h1>Svelte Simple Lang</h1>
<p>i18n for Svelte - <a href="https://github.com/harryhdt/svelte-simple-lang">Docs Github</a></p>
<p>Go to <a href="/ssr">SSR Mode</a></p>
<hr style="height: 1px;border: 0; background-color: #ddd;" />
<p>
	Client Mode
	<br />
	We use <span class="inline-note">localStorage</span> for store and set locale
	<br />
	Since it not ssr, you might see the locale changes after reload
</p>
<br />
<div class="block">
	<pre>
    {@html `
import { browser } from '$app/environment';
import { availableLocales, getLocale, setDefaultLocale, setLocale, t } from '$lib/lang/i18n.js';

// Svelte Kit wait for browser environment (not ssr)
if (browser) {
  setDefaultLocale((localStorage.getItem('locale') as 'en' | 'id') || 'id');
}

const toggleLocale = () => {
  const locale = getLocale();
  const newLocale = locale === 'en' ? 'id' : 'en';
  setLocale(newLocale);
  localStorage.setItem('locale', newLocale);
};
    `}
  </pre>
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
<p>
	Default locale: id
	<br />
	Available locale: {availableLocales.join(', ')}
</p>
<p>Current lang: {getLocale()}</p>
<button type="button" onclick={toggleLocale}> Change Locale (using localStorage) </button>
<br /><br />
<div class="block">
	<pre>{@html "<code>{t('world')}</code>"}</pre>
	<p>{t('world')}</p>
</div>
<div class="block">
	<pre>{@html "<code>{t('hello_{name}', { name: 'Johan' })}</code>"}</pre>
	<p>{t('hello_{name}', { name: 'Johan' })}</p>
</div>
<div class="block">
	<pre>{@html "<code>{t('hello_{name}', { name: t('world') })}</code>"}</pre>
	<p>
		{t('hello_{name}', { name: t('world') })}
		<span class="inline-note">// Nested</span>
	</p>
</div>
<div class="block">
	<pre>{@html "<code>{t('you_have_{count}_apple', { count: 1 })}</code>"}</pre>
	<p>
		{t('you_have_{count}_apple', { count: 1 })}
	</p>
</div>
<div class="block">
	<pre>{@html "<code>{t('you_have_{count}_apple', { count: 12 })}</code>"}</pre>
	<p>
		{t('you_have_{count}_apple', { count: 12 })}
		<span class="inline-note">// Set suffix _plural: {@html 'you_have_{count}_apple_plural'} </span>
	</p>
</div>
<div class="block">
	<pre>{@html "<code>{t('you_have_{count}_item', { count: 1 })}</code>"}</pre>
	<p>
		{t('you_have_{count}_item', { count: 1 })}
	</p>
</div>
<div class="block">
	<pre>{@html "<code>{t('you_have_{count}_item', { count: 12 })}</code>"}</pre>
	<p>
		{t('you_have_{count}_item', { count: 12 })}
		<span class="inline-note">// When you not set suffix _plural on lang json</span>
	</p>
</div>
<div class="block">
	<pre>{@html "<code>{t('you_have_{count}_item')}</code>"}</pre>
	<p>
		{t('you_have_{count}_item')}
		<span class="inline-note">// When you not set params</span>
	</p>
</div>
<div class="block">
	<pre>{@html "<code>{t('h.w')}</code>"}</pre>
	<p>
		{t('h.w')}
		<span class="inline-note">// Nested</span>
	</p>
</div>
<div class="block">
	<pre>{@html "<code>{t('h.c.w')}</code>"}</pre>
	<p>
		{t('h.c.w')}
		<span class="inline-note">// Nested Nested</span>
	</p>
</div>
<div class="block">
	<pre>{@html "<code>{t('h.d_{x}', { x: 'Dino' })')}</code>"}</pre>
	<p>
		{t('h.d_{x}', { x: 'Dino' })}
		<span class="inline-note">// Nested with params</span>
	</p>
</div>
<br /><br /><br />

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
