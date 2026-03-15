# Changelog

All notable changes to this project will be documented in this file.

## [0.0.4] - 2026-03-15

### 🐛 Bug Fixes & Improvements

- **Promise Return Types**: All async methods now return `Promise<boolean>` (true for success, false for failure) instead of `Promise<void>`
- **Error Handling**: Added try-catch in `loadLocale()` with detailed error logging to console
- **Locale Validation**: Enhanced null/undefined checks in `setLocale()`, `resetLocale()`, `setDefaultLocale()`
- **Race Condition Prevention**: Implemented promise chaining queue (`localeChangePromise`) to serialize concurrent locale changes
- **Enhanced Pluralization**: Added full support for `_zero` form (count === 0) in addition to singular and `_plural` forms
- **Count Validation**: Added NaN detection for count parameters with console warning
- **getNested Type Safety**: Improved function signature with proper return type `string | LocaleData | undefined` and null checks
- **Cache Eviction**: Implemented `evictOldestLocaleIfNeeded()` function using FIFO strategy for non-default locales
- **Type Safety in t()**: Added runtime check ensuring `t()` returns strings (not nested objects), logs warning if violated
- **Regex Escaping in Parameters**: Parameter names with special chars (`.`, `*`, `+`, `?`, `^`, `$`, `{`, `}`, `(`, `)`, `|`, `[`, `]`, `\`) are now escaped before regex replacement

### ✨ New Features

- **Configurable Cache Size**: New `maxCachedLocales` option to control concurrent locales in memory (default: 5, minimum: 2, validated at init)
- **Enhanced Pluralization**: Full support for `_zero` form (count === 0) for better UX ("You have no items" vs "You have 0 items")
- **Promise-based Error Handling**: All async methods return explicit success/failure status via `Promise<boolean>`

### ⚠️ Breaking Changes

- **Promise Return Types**: `setLocale()`, `resetLocale()`, `setDefaultLocale()` now return `Promise<boolean>` instead of `Promise<void>`
  - Callers must check the boolean return value or use `.catch()` for error handling
  - `true` indicates successful completion
  - `false` indicates failure (errors logged to console)
  - **Migration**: Update code to handle the returned boolean or error cases

### 🔄 Internal Implementation

- **Locale Change Queue**: Uses promise chaining (`localeChangePromise.then(...)`) to serialize operations and prevent race conditions
- **Cache Eviction Strategy**: FIFO-based eviction where oldest non-default locales are removed first
- **Parameter Regex Safety**: Special characters in parameter names are escaped: `paramKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`
- **Error Handlers**: All promise chains include `.catch()` with logging to console and appropriate error status returns
- **Type Narrowing**: Improved type guards in `getNested()` and value type checking in `t()`

---

## [0.0.3] - Previous Release

Initial release with:

- Type-safe i18n with automatic key inference
- Lazy loading for language files
- Nested translation keys with dot notation
- Basic pluralization (\_singular, \_plural)
- Parameter interpolation
- Svelte 5 reactive state integration
- Zero external dependencies
