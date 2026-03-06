# Architecture - Projem

## Pattern
The project follows a **Feature-Based Architecture** with clear separation between UI, logic, and data layers.

## Layers
- **Presentation Layer**: React components located in `src/components` and `src/features`.
- **Logic Layer**: Business logic and state management using React Context (`src/context`) and custom hooks (`src/hooks`).
- **Data Layer**: Service modules in `src/services` handle Firebase interactions and external API calls.
- **Resource Layer**: Static data, translations (`src/i18n.js`), and assets.

## Data Flow
1. **Trigger**: User interaction in a Component.
2. **Action**: Component calls a Custom Hook or Service function.
3. **Processing**: Service interacts with Firebase/API. State is updated via Context.
4. **Update**: Components re-render based on new state.

## Entry Points
- **Web**: `index.html` -> `src/main.jsx` -> `src/App.jsx`
- **Mobile**: Capacitor bridge initialized in `main.jsx` and configured via `capacitor.config.ts`.
