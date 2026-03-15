# Svelte Simple Lang

**Svelte Simple Lang** is a lightweight library to manage **multi-language** (i18n) for your Svelte project. It comes with a simple setup, built-in support for lazy loading of language files, nested keys, pluralization, parameter interpolation, and type safety.

## ✨ Features

- 🛠 TypeScript Support — Full type safety with automatic key inference and parameter validation
- 📦 Lightweight & Fast — Zero external dependencies, minimal footprint
- 🌍 Easy Language Switching — Seamless switching with async/await, race-condition safe
- 🔐 Full Type-Safety — Compile-time key and parameter checking from JSON files
- 🚨 Missing Key Warnings — Gracefully handles missing keys with console notifications
- 🧩 Nested Translation Keys — Hierarchical organization (e.g., menu.file.new)
- 🔄 Lazy Loading — Load locales on-demand, reduce bundle size
- ⚖️ Advanced Pluralization — Support for \_zero, singular, and \_plural forms
- 📝 Parameter Interpolation — Dynamic content with automatic regex escape handling
- 💾 Smart Caching — LRU cache with configurable size, prevents memory leaks
- 🛡️ Production-Ready — Comprehensive error handling, validation, and edge case protection
- 🚦 Race Condition Safe — Promise queue prevents concurrent locale change conflicts

## 📦 Installation

```bash
npm install svelte-simple-lang
```

## ⚙️ Setup

When using `createLang()` you need to provide:

| Property           | Type     | Required | Description                                           |
| ------------------ | -------- | -------- | ----------------------------------------------------- |
| `defaultLocale`    | `string` | ✅ Yes   | The default language to use at startup                |
| `defaultSource`    | `object` | ✅ Yes   | Language data for the default locale (eager loaded)   |
| `sources`          | `object` | ✅ Yes   | Map of locale to language data (eager or lazy-loaded) |
| `maxCachedLocales` | `number` | ❌ No    | Max concurrent locales in memory (default: 5, min: 2) |

```typescript
// src/lib/lang/i18n.ts
import createLang from 'svelte-simple-lang';
import id from './id.json' with { type: 'json' };

const i18n = createLang({
	// Required: default locale and its data (must be eagerly loaded)
	defaultLocale: 'id',
	defaultSource: id,

	// Required: all available locales (can be eager or lazy-loaded)
	sources: {
		id: id,
		en: () => import('./en.json')
	},

	// Optional: configure cache size (default: 5, min: 2)
	maxCachedLocales: 5
});

export const { availableLocales, getLocale, resetLocale, setLocale, setDefaultLocale, t } = i18n;
export default i18n;
```

## 🛠️ API Reference

| Function                   | Returns            | Description                                               |
| -------------------------- | ------------------ | --------------------------------------------------------- |
| `t(key, params)`           | `string`           | Translate a key with optional parameters                  |
| `setLocale(locale)`        | `Promise<boolean>` | Switch to locale (async, returns success status)          |
| `getLocale()`              | `string`           | Get currently active locale                               |
| `resetLocale()`            | `Promise<boolean>` | Reset to default locale (async, returns success status)   |
| `setDefaultLocale(locale)` | `Promise<boolean>` | Set as default and switch (async, returns success status) |
| `availableLocales`         | `string[]`         | Array of all available locale codes                       |

**All async methods return `Promise<boolean>`:**

- `true` = successfully completed
- `false` = failed (error logged to console)

## 🧩 Language Files

**en.json**

```json
{
	"world": "World",
	"hello_{name}": "Hello {name}",
	"you_have_{count}_apple": "You have {count} apple",
	"you_have_{count}_apple_plural": "You have {count} apples",
	"you_have_{count}_apple_zero": "You have no apples",
	"menu": {
		"home": "Home",
		"about": "About"
	}
}
```

**id.json**

```json
{
	"world": "Dunia",
	"hello_{name}": "Halo {name}",
	"you_have_{count}_apple": "Kamu punya {count} apel",
	"you_have_{count}_apple_plural": "Kamu punya {count} apel",
	"you_have_{count}_apple_zero": "Kamu tidak punya apel",
	"menu": {
		"home": "Beranda",
		"about": "Tentang"
	}
}
```

**Key Features:**

- Nested Keys: use dot notation (e.g., `t('menu.home')`)
- Parameters: use `{paramName}` syntax
- Pluralization: `_plural` for count > 1, `_zero` for count === 0

## 🚀 Quick Start

### Client-Side (Browser)

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	import { setDefaultLocale, setLocale, getLocale, t, availableLocales } from '$lib/lang/i18n';

	// Initialize saved locale preference
	const initLocale = async () => {
		const saved = (localStorage.getItem('locale') as 'en' | 'id') ?? 'id';
		await setDefaultLocale(saved);
	};

	if (browser) {
		initLocale();
	}

	const changeLanguage = async (newLocale: string) => {
		const success = await setLocale(newLocale);
		if (success) {
			localStorage.setItem('locale', newLocale);
		}
	};
</script>

<h1>{t('world')}</h1>
<p>Count: {t('you_have_{count}_apple', { count: 5 })}</p>

{#each availableLocales as locale}
	<button on:click={() => changeLanguage(locale)}>{locale}</button>
{/each}
```

### Server-Side (SSR)

```typescript
// src/hooks.server.ts
import { setDefaultLocale } from '$lib/lang/i18n';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const userLocale = (event.cookies.get('lang') as 'en' | 'id') ?? 'id';
	await setDefaultLocale(userLocale);
	return resolve(event);
};
```

## 📚 Complete Documentation

For advanced usage, error handling, best practices, caching strategies, and more:

**→ See [USAGE.md](./USAGE.md) for full documentation**

[Check full example](https://svelte-simple-lang.harryhdt.dev)

## 🎯 Production Features

Built for enterprise reliability:

- ✅ Enhanced pluralization with `_zero`, singular, and `_plural` forms
- ✅ Configurable cache size with LRU eviction
- ✅ Promise queue prevents race conditions
- ✅ All async methods return `Promise<boolean>` for error detection
- ✅ Comprehensive error handling and validation
- ✅ Type-safe with no `any` types
- ✅ Special character escaping in parameters
- ✅ Memory-safe with bounded cache limits

## 🔗 Resources

- 📖 [Complete Usage Guide](./USAGE.md) - Detailed API and patterns
- 📋 [Changelog](./CHANGELOG.md) - Version history and improvements
- 🎨 [Live Demo](https://svelte-simple-lang.harryhdt.dev) - Interactive examples

## License

MIT
