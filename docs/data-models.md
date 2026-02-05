# Data Models: Huzur App

This document outlines the data structures used in the application, both for local static data and remote Firestore collections.

## 📂 Local Data (`src/data/`)

Static JSON/JS objects used for app content.

### `prayers.js`
- **Purpose**: Specific prayer supplications.
- **Structure**:
```javascript
{
  id: string,
  title: string,
  arabic: string,
  transliteration: string,
  translation: string, // Localized
  category: string,
  tags: string[]
}
```

### `hadiths.js`
- **Purpose**: Collection of Hadiths.
- **Structure**:
```javascript
{
  id: string,
  source: string, // e.g., Bukhari
  number: number,
  arabic: string,
  text: string, // Localized
  topics: string[]
}
```

### `esmaUlHusnaData.js`
- **Purpose**: List of the 99 Names of Allah.
- **Structure**:
```javascript
{
  id: number,
  name: string, // Arabic
  transliteration: string,
  meaning: string, // Localized
  benefits: string // Optional description
}
```

## 🔥 Firestore Collections

Data stored remotely in Firebase Firestore.

### `users` Collection
- **Path**: `/users/{userId}`
- **Purpose**: User profiles and settings.
- **Schema**:
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  createdAt: Timestamp,
  settings: {
    language: string, // 'en', 'tr', etc.
    theme: string, // 'light', 'dark'
    notificationsEnabled: boolean
  },
  premium: boolean,
  currentStreak: number
}
```

### `user_progress` Collection (Subcollection of `users` or Separate)
- **Path**: `/users/{userId}/progress/{date}`
- **Purpose**: Daily tracking data.
- **Schema**:
```javascript
{
  date: string, // 'YYYY-MM-DD'
  prayersCompleted: {
    fajr: boolean,
    dhuhr: boolean,
    asr: boolean,
    maghrib: boolean,
    isha: boolean
  },
  quranRead: number, // pages or verses count
  dailyDhikr: number // count
}
```

### `community_posts` (If applicable)
- **Path**: `/posts/{postId}`
- **Purpose**: User-generated content sharing.
- **Schema**:
```javascript
{
  authorId: string,
  content: string,
  createdAt: Timestamp,
  likes: number,
  commentsCount: number
}
```

## 💾 Local Storage Keys (Capacitor Preferences)

Data persisted on the device for offline access or app state.

- `user_settings`: JSON string of basic app settings.
- `auth_token`: Firebase auth token (managed by SDK).
- `last_sync_time`: Timestamp of last data fetch.
- `cached_prayer_times`: JSON of current month's prayer times.
