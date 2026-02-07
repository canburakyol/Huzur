# Source Tree Analysis: Huzur App

This document provides a detailed map of the `Huzur App` codebase, explaining the purpose and contents of key directories and files.

## 🌳 Directory Structure

The project follows a standard Vite + Capacitor structure, organized for modularity and scalability.

### Root Directory (`d:/Projem/`)

The root directory contains configuration files and top-level project folders.

- `package.json`: Project metadata, dependencies, and scripts.
- `vite.config.js`: Configuration for the Vite build tool.
- `capacitor.config.ts`: Configuration for Capacitor cross-platform runtime.
- `firebase.json`: Configuration for Firebase services (Hosting, Functions).
- `tsconfig.json`: TypeScript compiler configuration.
- `.env`: Environment variables (API keys, config flags).

### Source Directory (`src/`)

The core application logic resides here.

#### Application Entry Points
- `src/main.jsx`: The application entry point. Initializes React and mounts the app.
- `src/App.jsx`: The root component. Handles routing and global providers.
- `src/index.css`: Global styles and Tailwind imports.

#### Key Modules
- `src/components/`: Reusable UI components.
    - `layout/`: Components for page layout (Header, Footer, Sidebar).
    - `ui/`: Generic UI elements (Buttons, Inputs, Cards).
    - `features/`: Feature-specific components (PrayerTimesCard, QuranReader).
- `src/pages/`: Route-based page components. Each file corresponds to a screen in the app.
- `src/services/`: Business logic and API interaction layer.
    - `authService.js`: Authentication logic (Login, Signup, User Management).
    - `prayerService.js`: Integration with external prayer time APIs.
    - `quranService.js`: Logic for fetching and displaying Quran text.
    - `firebase.js`: Firebase initialization and instance exports.
- `src/context/`: React Context providers for global state management.
    - `AuthContext.js`: manages user authentication state.
    - `ThemeContext.js`: manages application theme (dark/light mode).
- `src/hooks/`: Custom React hooks for shared logic.
    - `useAuth.js`: Hook to access auth context.
    - `useLocation.js`: Hook to access device location.
- `src/utils/`: Utility functions and helpers.
    - `dateUtils.js`: Date formatting and manipulation.
    - `formatters.js`: String formatting helpers.
- `src/assets/`: Static assets imported in code (images, icons).

### Public Directory (`public/`)

Static assets served directly without processing by Vite.
- `favicon.ico`: Browser tab icon.
- `manifest.json`: PWA manifest file.
- `robots.txt`: Search engine crawling rules.

### Android Directory (`android/`)

Project files for the native Android application capabilities.
- `app/`: The Android application module (Java/Kotlin code, resources).
- `build.gradle`: Build configuration for the Android project.

### Functions Directory (`functions/`)

Backend logic running on Firebase Cloud Functions.
- `index.js`: Entry point for cloud functions.
- `package.json`: Dependencies for cloud functions environment.

## 🔗 Integration Points

- **Frontend -> Backend**: The `src/services` layer acts as the bridge, calling Firebase Functions or direct Firestore queries.
- **Frontend -> Native**: Capacitor plugins bridge the web app to native device features (Camera, Geolocation, Push Notifications).
