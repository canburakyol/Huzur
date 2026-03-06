# Scoped Workflow

Goal: avoid full-repo scans and work module by module.

## 1) List scopes

```bash
npm run scope:files -- list
```

## 2) Print files for a scope

```bash
npm run scope:files -- lifestyle
npm run scope:files -- backend
```

Feature scopes are derived from `src/features/*/index.js`.
Static scopes are curated for infra-heavy work:
- `backend`
- `android`
- `monetization`
- `notifications`
- `release`
- `localization`

## 3) Task format

Use this request style:

```text
scope:<scope-name> <what to change>
```

Examples:
- `scope:monetization rewarded ad flowunda bug var`
- `scope:education nuzul explorer ekranina loading state ekle`
- `scope:backend revenuecat webhook loglarini duzelt`

## 4) Scope expansion rule

Only expand outside the current scope when:
- Build/test output points to another file.
- Shared utility is required for a safe fix.
- Security or data integrity requires cross-module validation.

When expanding, record one short reason in the task notes.
