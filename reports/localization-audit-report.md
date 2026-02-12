# Localization Audit Report

Generated: 2026-02-10T17:54:56.878Z

## Scope
- Namespace integrity: `src/config/i18nConfig.js` vs `public/locales/*/*.json`
- Key diff targets: `translation.json`, `tajweed.json` (reference locale: `tr`)

## Language Folder Check
- Supported language codes: `tr`, `en`, `ar`, `id`, `es`, `fr`, `de`
- Locale folders: `ar`, `de`, `en`, `es`, `fr`, `id`, `tr`
- Missing language folders: —
- Extra language folders: —

## Namespace Integrity
- Configured namespaces: `translation`, `components`, `surahs`, `tajweed`, `wordByWord`, `prayers`, `zikirWorld`, `esma`, `hadiths`, `legal`, `multimedia`, `prayerTeacher`, `tespihat`
- Missing configured namespaces (any locale): —
- Extra namespaces on disk (any locale): —

| Locale | Missing configured namespaces | Extra namespaces on disk |
|---|---|---|
| ar | — | — |
| de | — | — |
| en | — | — |
| es | — | — |
| fr | — | — |
| id | — | — |
| tr | — | — |

## Key Diff Summary
| Namespace | Locale | Missing Keys | Extra Keys | Missing Sample | Extra Sample |
|---|---|---:|---:|---|---|
| translation | ar | 0 | 0 | — | — |
| translation | de | 0 | 0 | — | — |
| translation | en | 0 | 0 | — | — |
| translation | es | 0 | 0 | — | — |
| translation | fr | 0 | 0 | — | — |
| translation | id | 0 | 0 | — | — |
| translation | tr | 0 | 0 | — | — |
| tajweed | ar | 0 | 0 | — | — |
| tajweed | de | 0 | 0 | — | — |
| tajweed | en | 0 | 0 | — | — |
| tajweed | es | 0 | 0 | — | — |
| tajweed | fr | 0 | 0 | — | — |
| tajweed | id | 0 | 0 | — | — |
| tajweed | tr | 0 | 0 | — | — |

## Result
- Namespace mismatch: PASS
- Key diff mismatch: PASS
