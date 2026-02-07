# Component Inventory: Huzur App

This document lists the reusable UI components and feature-specific components available in `src/components/`.

## 📦 UI Components (`src/components/ui/`)

Generic, reusable UI elements.

- **Button**: Standard button component with variants (primary, secondary, outline).
- **Card**: Container component for grouping content.
- **Input**: Form input field with validation support.
- **Loader**: Loading spinner/indicator.
- **Modal**: Overlay dialog for alerts or forms.
- **Toast**: Notification message component.
- **Tabs**: Tabbed navigation container.
- **Badge**: Status indicator or counter.

## 🧩 Feature Components (`src/components/features/`)

Components specific to application features.

### Prayer Times
- **PrayerTimesCard**: Displays prayer times for the current day.
- **PrayerTimesList**: List view of prayer times.
- **QiblaCompass**: Visual compass pointing to Qibla.

### Quran
- **QuranReader**: Component for displaying Quran text.
- **AudioPlayer**: specialized player for Quran recitations.
- **SurahList**: List of Quran chapters.

### Daily Content
- **DailyVerse**: Card displaying the verse of the day.
- **HadithCard**: Card displaying a daily Hadith.
- **PrayerCard**: Card displaying a daily supplication.

### Tracking
- **HabitTracker**: Visual tracker for daily habits (prayers, reading).
- **StatsChart**: Chart component for visualizing user progress.

## 📐 Layout Components (`src/components/layout/`)

Structural components for page layout.

- **Header**: Top navigation bar.
- **BottomNav**: Bottom tab navigation for mobile.
- **Sidebar**: Side navigation menu (if applicable).
- **PageContainer**: Wrapper for page content with standard padding.

## 🛠 Context Providers (`src/context/`)

Though not strictly "visual" components, these providers wrap the application tree.

- **AuthProvider**: Manages user authentication state.
- **ThemeProvider**: Manages application theme/mode.
- **LanguageProvider**: Manages active language and translations.
