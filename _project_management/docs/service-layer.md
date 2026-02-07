# Service Layer: Huzur App

## Overview

The Service Layer in `src/services/` encapsulates all business logic and external data fetching. React components should interact with services, not directly with Firebase or APIs to maintain separation of concerns.

## 🔐 Auth Service (`authService.js`)

Manages user authentication and session handling.

- **`login(email, password)`**: Authenticates user via Firebase Auth.
- **`signup(email, password, displayName)`**: Creates a new user account.
- **`logout()`**: Signs the user out.
- **`resetPassword(email)`**: Sends a password reset email.
- **`updateProfile(data)`**: Updates the user's display name or photo.

## 🕌 Prayer Service (`prayerService.js`)

Handles retrieval and calculation of prayer times.

- **`getPrayerTimes(latitude, longitude, date)`**: Fetches prayer times from Aladhan API or local calculation.
- **`getNextPrayerTime(times)`**: Calculates the next prayer time based on current time.
- **`getHijriDate(date)`**: Converts Gregorian date to Hijri date.

## 📖 Quran Service (`quranService.js`)

Manages Quran text retrieval and audio playback.

- **`getSurahList()`**: Returns a list of all 114 Surahs.
- **`getSurahDetails(surahId)`**: Fetches the text (Arabic + Translation) for a specific Surah.
- **`searchQuran(query)`**: Searches for verses containing specific keywords.
- **`getAudioUrl(reciterId, surahId)`**: Returns the stream URL for audio recitation.

## 🔥 Firebase Service (`firebase.js`)

Central configuration for Firebase SDK.

- **`db`**: Firestore instance.
- **`auth`**: Auth instance.
- **`functions`**: Cloud Functions instance.
- **`storage`**: Storage bucket instance.

## 🔔 Notification Service (`notificationService.js`)

Abstracts the Capacitor Push Notifications plugin.

- **`requestPermissions()`**: Requests notification permissions from the OS.
- **`scheduleLocalNotification(title, body, date)`**: Schedules a local notification (e.g., for prayer time).
- **`subscribeToTopic(topic)`**: Subscribes the device to a FCM topic (e.g., 'daily-verse').

## 📍 Location Service (`locationService.js` / internal)

- **`getCurrentPosition()`**: Wrapper around Capacitor Geolocation plugin to get user coordinates.
