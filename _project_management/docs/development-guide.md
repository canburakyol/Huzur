# Development Guide: Huzur App

This guide outlines the steps to set up the development environment, run the app locally, and build for production.

## 🛠 Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 18.x or 20.x (Recommended).
- **npm**: Version 9.x or later.
- **Java JDK**: Version 17 (Required for Android build).
- **Android Studio**: For running the native Android app.
- **Git**: For version control.

## 🚀 Setting Up the Project

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd huzur-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Create a `.env` file in the root directory.
   - Add necessary keys (Firebase config, API keys).
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

4. **Sync Capacitor Plugins:**
   ```bash
   npx cap sync
   ```

## 🏃 Running the App

### Web (Development Mode)
Starts the Vite dev server with Hot Module Replacement (HMR).
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Android Emulator / Device
1. Build the web assets:
   ```bash
   npm run build
   ```
2. Sync changes to the native project:
   ```bash
   npx cap sync
   ```
3. Open Android Studio:
   ```bash
   npx cap open android
   ```
4. Click "Run" in Android Studio to launch on a connected device or emulator.

### Live Reload on Android
To see changes on the device without rebuilding:
1. Ensure your device is on the same Wi-Fi as your PC.
2. In `capacitor.config.ts`, uncomment the `server` block and set your PC's IP address.
   ```typescript
   server: {
     url: 'http://192.168.1.x:5173',
     cleartext: true
   }
   ```
3. Run `npx cap copy` and `npm run dev`.

## 📦 Building for Production

### Web Build
Generates optimized static assets in the `dist/` folder.
```bash
npm run build
```

### Android APK/Bundle
1. Run the build command:
   ```bash
   npm run build
   npx cap sync
   ```
2. Open Android Studio (`npx cap open android`).
3. Go to `Build` > `Generate Signed Bundle / APK`.
4. Follow the wizard to create a release build.

## 🧪 Testing

- **Linting**:
  ```bash
  npm run lint
  ```
- **Unit Tests** (if set up):
  ```bash
  npm test
  ```

## 📝 Common Issues

- **"Gradle sync failed"**: Ensure JDK 17 is selected in Android Studio settings.
- **"Plugin not found"**: Run `npm install` and `npx cap sync`.
- **"White screen on device"**: Check Logcat in Android Studio for JS errors.
