# Directory Structure - Projem

## Root Organization
- `android/` - Android native project (Capacitor generated)
- `e2e/` - Playwright E2E tests
- `public/` - Static assets copied to build
- `src/` - Application source code

## Source Code Organization (`src/`)
- `assets/` - Images, icons, and styles
- `components/` - Reusable UI components (buttons, cards, etc.)
- `config/` - App configuration and environment setup
- `constants/` - Global constants and enums
- `context/` - React Context providers (Global state)
- `data/` - Static JSON data and content
- `features/` - Complex feature modules (e.g., Quran, Prayer Times, AI)
- `hooks/` - Custom React hooks for shared logic
- `plugins/` - Capacitor or third-party plugin integrations
- `services/` - External service interactions (Firebase, Admob, etc.)
- `utils/` - Pure helper/utility functions

## Naming Conventions
- **Components**: PascalCase (e.g., `HeroPrayerCard.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useDua.js`)
- **Services/Utils**: camelCase (e.g., `logger.js`)
- **Directories**: lowercase or kebab-case
