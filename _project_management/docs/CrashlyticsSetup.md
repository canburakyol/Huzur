# Crashlytics Setup (Android + JS bridge)

Overview
- We enable Crashlytics to collect crash reports from Android native crashes and non-fatal JS errors via a Capacitor plugin bridge.

What you’ll need
- google-services.json placed at android/app/google-services.json (Firebase project configured)
- Firebase Crashlytics enabled in the Firebase console for your project
- App runs with the latest Capacitor Android setup (capacitor-android)

What we added
- Android: CrashlyticsPlugin.java (Capacitor plugin) to receive log and logException calls from JS and forward to Crashlytics.
- JS: crashlyticsReporter.js to call the native Crashlytics plugin when available.
- UI: ErrorBoundary for React to catch UI errors (already added) and global error handlers.

How to use from code
- Import the reporter and log events as needed:
  - logCrash('Something went wrong during login')
  - logException(new Error('Invalid data'))

Follow-up steps
- Ensure google-services.json is present and Crashlytics dashboards show data after app usage.
- Test by forcing an error in a controlled way and verify Crashlytics reports in the Firebase console.
