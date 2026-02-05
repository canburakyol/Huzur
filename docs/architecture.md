# Architecture: Huzur App

## Overview

The **Huzur App** employs a **Hybrid Monolithic** architecture, leveraging web technologies (`React`, `Typescript`, `Vite`) packaged as a native mobile application using **Capacitor**. This approach allows for a single codebase to serve both iOS and Android platforms while maintaining the flexibility of a web application.

## 🏗 Architecture Components

### 1. Presentation Layer (Frontend)
- **Framework**: `React 19` (Function Components + Hooks).
- **Core Library**: `Vite` for fast HMR and optimized builds.
- **Routing**: Client-side routing for navigating between app screens.
- **State Management**: React `Context API` for global state (Auth, Theme) and local component state.
- **Styling**: `Tailwind CSS` for utility-first styling and responsiveness.

### 2. Service Layer (Business Logic)
- **Purpose**: Encapsulates business rules and data fetching logic.
- **Implementation**: Dedicated service files in `src/services/` (e.g., `authService.js`, `prayerService.js`).
- **Responsibilities**:
    - **Authentication**: Managing user sessions.
    - **Data Fetching**: Retrieving data from Firestore or external APIs.
    - **Device Integration**: Interfacing with native features via Capacitor.

### 3. Data Layer (Backend & Persistence)
- **Primary Backend**: `Firebase` (Backend-as-a-Service).
- **Database**: `Cloud Firestore` (NoSQL) for storing user data, settings, and app content.
- **Authentication**: `Firebase Auth` for secure user identity management.
- **Static Assets**: `Firebase Storage` for content storage (images, audio).
- **Server-Side Logic**: `Firebase Cloud Functions` for backend tasks like notifications or scheduled jobs.

### 4. Native Bridge (Capacitor)
- **Role**: Acts as a bridge between the web app and the native device capabilities.
- **Plugins**: Used to access:
    - **AdMob**: For displaying native ads.
    - **Push Notifications**: For alerts (Azan, updates).
    - **Geolocation**: For calculating prayer times.
    - **Storage**: For offline data caching.

## 🔄 Data Flow

1. **User Interaction**: User triggers an action in a React Component (e.g., "Log Prayer").
2. **Service Call**: Component calls a method in the Service Layer (e.g., `prayerService.logPrayer()`).
3. **API/DB Request**:
    - Service communicates with Firebase SDK to update Firestore `users` collection.
    - OR Service calls an external API (e.g., Aladhan API) to fetch data.
4. **State Update**:
    - Service updates the local React State/Context with the new data.
    - UI re-renders to reflect the change.
5. **Native Action** (Optional):
    - Service invokes a Capacitor plugin (e.g., `LocalNotifications` to schedule a reminder).

## 🔒 Security

- **Authentication**: Managed via Firebase Auth (Email/Password, Google Sign-In).
- **Database Rules**: Firestore Security Rules ensure users access only their own data.
- **API Keys**: Stored in environment variables (`.env`).
- **App Check**: Implementation of Firebase App Check where applicable to verify requests come from the authentic app.

## 📱 Build & Deployment

- **Web Build**: `vite build` generates static assets in `dist/`.
- **Native Sync**: `npx cap sync` copies `dist/` to the native platform folders (`android/`).
- **Native Build**: Android Studio compiles the native project into an APK/AAB.
