# AGENTS Instructions for D:\Projem

## Scope-First Workflow
- Do not scan the full repository unless the user explicitly asks for a full audit.
- Start every task by selecting a scope.
- Run `npm run scope:files -- <scope>` before reading files.
- Limit edits to files in that scope plus direct dependencies required to complete the task.
- If scope must expand, state why in one line before expanding.

## Scope Keys
- Feature scopes: `ai`, `content`, `core`, `education`, `family`, `ibadet`, `lifestyle`, `social`, `system`, `tools`
- Static scopes: `backend`, `android`, `monetization`, `notifications`, `release`, `localization`

## Fast Task Format
- Use `scope:<name>` in user requests.
- Example: `scope:lifestyle streak ekraninda bug var`
- If no scope is given, pick the best scope and state the assumption in one sentence.

## Edit Safety
- Do not touch unrelated files.
- Keep checkpoint commits scoped to task files unless user asks otherwise.
