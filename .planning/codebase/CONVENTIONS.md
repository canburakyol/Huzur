# Coding Conventions - Projem

## Language & Style
- **Language**: JavaScript (ES6+) with ESM modules.
- **Formatting**: Managed by ESLint with a focus on React best practices.
- **Rules**:
  - No `any` types (if using TS).
  - Use object destructuring.
  - Functional components over classes.

## Naming Standards
- **Components**: PascalCase (e.g., `DiscoverFeed.jsx`).
- **Hooks**: camelCase with `use` prefix (e.g., `useDua.js`).
- **Utilities/Services**: camelCase (e.g., `logger.js`).
- **CSS Classes**: Kebab-case or CamelCase depending on the component style.

## Patterns
- **Hooks for Logic**: Complex component logic is extracted into custom hooks.
- **Services for APIs**: All external calls (Firebase, etc.) are encapsulated in `src/services`.
- **Global State**: Managed via React Context in `src/context`.

## Error Handling
- Use `try/catch` blocks in asynchronous service calls.
- Log errors using the centralized `logger` utility (`src/utils/logger.js`).
