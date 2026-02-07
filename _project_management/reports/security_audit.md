# Security Audit Report
**Date:** 2026-02-05
**Scope:** Full Project (`src/`)

## 1. Secrets Management
### ⚠️ Gemini API Key Exposure
- **File:** `services/geminiService.js`
- **Issue:** The code references `import.meta.env.VITE_GEMINI_API_KEY` and makes direct client-side calls (`axios.post`) to the Gemini API (`generativelanguage.googleapis.com`).
- **Risk:** The API key is embedded in the build bundle. Anyone can extract it and use your quota.
- **Misleading Comment:** Line 114 claims "callGeminiDirectly function removed for security... only Cloud Functions used", but `generateContent` (line 139) clearly performs a direct call.
- **Reference:** `const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';`
- **Mitigation:** Move this logic to `functions/` (Firebase Cloud Functions) as the comment suggests, or restrict the API Key in Google Cloud Console to only allow requests from your specific Android package name / SHA1.

### ✅ Firebase Config
- **File:** `services/firebase.js`
- **Status:** Uses `import.meta.env` variables. This is standard and safe for Firebase as security is handled via Security Rules, not key secrecy.

### ✅ RevenueCat
- **File:** `services/revenueCatService.js`
- **Status:** Uses platform-specific public keys. Safe.

## 2. Authentication
### ✅ Anonymous Auth
- **File:** `services/authService.js`
- **Status:** Good implementation of Firebase Anonymous Auth with fallback to random ID generation if network fails.
- **Feature:** Securely stores fallback IDs.

## 3. Data Privacy
### ⚠️ Local Notifications
- **Status:** Notifications may contain sensitive prayer/religious data.
- **Check:** Ensure sensitive user data (e.g. personal journals) is not displayed in lock-screen notifications without "Secret" visibility setting (Android).

## 4. Recommendations
1.  **High Priority:** Restrict the Gemini API Key in Google Cloud Console immediately to prevent abuse.
2.  **Medium Priority:** Migrate `geminiService.generateContent` to a Firebase Cloud Function (`onCall`) to truly hide the key.
3.  **Low Priority:** Audit Firebase Security Rules (`firestore.rules`) - *Not checked in this pass but critical for production.*
