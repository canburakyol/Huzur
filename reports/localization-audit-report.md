# Localization Audit Report

Generated: 2026-07-05T02:37:51.479Z

## Scope
- Namespace integrity: `src/config/i18nConfig.js` vs `public/locales/*/*.json`
- Key diff targets: `translation.json`, `tajweed.json` (reference locale: `tr`)

## Language Folder Check
- Supported language codes: `tr`, `en`, `id`, `de`
- Locale folders: `de`, `en`, `id`, `tr`
- Missing language folders: —
- Extra language folders: —

## Namespace Integrity
- Configured namespaces: `translation`, `components`, `surahs`, `tajweed`, `wordByWord`, `prayers`, `zikirWorld`, `esma`, `hadiths`, `legal`, `multimedia`, `prayerTeacher`, `tespihat`
- Missing configured namespaces (any locale): —
- Extra namespaces on disk (any locale): —

| Locale | Missing configured namespaces | Extra namespaces on disk |
|---|---|---|
| de | — | — |
| en | — | — |
| id | — | — |
| tr | — | — |

## Key Diff Summary
| Namespace | Locale | Missing Keys | Extra Keys | Missing Sample | Extra Sample |
|---|---|---:|---:|---|---|
| translation | de | 19 | 0 | `assistant.questions.q7`, `assistant.questions.q8`, `assistant.questions.q9`, `assistant.questions.q10`, `assistant.questions.q11`, `assistant.questions.q12`, `assistant.questions.q13`, `assistant.questions.q14`, `assistant.questions.q15`, `assistant.questions.q16` | — |
| translation | en | 0 | 0 | — | — |
| translation | id | 19 | 0 | `assistant.questions.q7`, `assistant.questions.q8`, `assistant.questions.q9`, `assistant.questions.q10`, `assistant.questions.q11`, `assistant.questions.q12`, `assistant.questions.q13`, `assistant.questions.q14`, `assistant.questions.q15`, `assistant.questions.q16` | — |
| translation | tr | 0 | 0 | — | — |
| tajweed | de | 0 | 0 | — | — |
| tajweed | en | 0 | 0 | — | — |
| tajweed | id | 0 | 0 | — | — |
| tajweed | tr | 0 | 0 | — | — |

## Result
- Namespace mismatch: PASS
- Key diff mismatch: FAIL
