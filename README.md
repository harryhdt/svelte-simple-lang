# Svelte Simple Lang

**Svelte Simple Lang** is a lightweight library to manage **multi-language** (i18n) for your Svelte project. It comes with a simple setup, built-in support for lazy loading of language files, nested keys, pluralization, parameter interpolation, and type safety.

## ✨ Features

- 🛠 TypeScript Support — Enjoy smart autocompletion, type checking, and an overall smoother developer experience.
- 📦 Lightweight and Fast — No heavy dependencies, providing a minimal footprint.
- 🌍 Easy Language Switching — Seamless switching between languages with simple API calls.
- 🧠 Full Type-Safety — Based on your JSON language files, ensuring a safe and predictable experience.
- 🚨 Missing Key or Locale Warnings — Get notified if a key or locale is missing.
- 🧩 Nested Translation Keys — Support for nested translation keys (e.g., menu.file.new).
- 🔄 Lazy Loading — Language files are lazy-loaded when needed, reducing initial load time.
- ⚖️ Pluralization Support — Automatically handles plural forms for keys (e.g., items vs items_plural).
- 📝 Parameter Interpolation — Supports dynamic parameters in translations (e.g., Welcome, {name}).

## 📦 Installation

```bash
npm install svelte-simple-lang
```

## ⚙️ Setup

When using `createLang()` you need to provide:

| Property        | Type                            | Description                                                  |
| --------------- | ------------------------------- | ------------------------------------------------------------ |
| `defaultLocale` | `string`                        | The default language to use.                                 |
| `defaultSource` | `Promise<JSON>`                 | The source for the default language.                         |
| `sources`       | `Record<string, Promise<JSON>>` | Object (imported json) containing all language dictionaries. |

```typescript
// i18n.ts
import { createLang } from '../index.js';
import id from './id.json' with { type: 'json' };

const i18n = createLang({
	defaultLocale: 'id',
	defaultSource: id,
	sources: {
		id: id,
		en: () => import('./en.json') // optional lazy load
	}
});

export const { availableLocales, getLocale, resetLocale, setLocale, setDefaultLocale, t } = i18n;
export default i18n;
```

## 🛠️ API

You can use object spread `const { t, setLocale, ... } = ...` or a single variable `const i18n = ...` for this.

| Function                           | Description                                        |
| ---------------------------------- | -------------------------------------------------- |
| `t(key): string`                   | Translates a given key based on the active locale. |
| `async` `setLocale(locale)`        | Changes the active locale                          |
| `getLocale(): string`              | Returns the currently active locale.               |
| `async` `resetLocale()`            | Resets to the default locale.                      |
| `async` `setDefaultLocale(locale)` | Set default locale                                 |
| `availableLocales`                 | Returns an array of all available locales.         |

## 🧩 Example of Language Files

```
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
```

## 🚀 Usage

### No SSR

```svelte
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

<p>{t('world')}</p>
```

[Check full example](https://svelte-simple-lang.harryhdt.dev)

### SSR

```typescript
// +layout.server.ts
import type { LayoutServerLoad } from './$types.js';
export const load: LayoutServerLoad = async ({ url }) => {
	const params = url.searchParams; // for handle url.com/ssr?lang=en
	const paramsLang = params.get('lang') || '';
	// Generate randomly (in a real app, you might use a database to store the locale for each user)
	const lang = (
		['id', 'en'].includes(paramsLang) ? paramsLang : Math.random() > 0.5 ? 'id' : 'en'
	) as 'id' | 'en';
	return {
		lang
	};
};
```

```svelte
<!-- +page.svelte -->
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

<p>{t('world')}</p>
```

[Check full example](https://svelte-simple-lang.harryhdt.dev)

## License

MIT
