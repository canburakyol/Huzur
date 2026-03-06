# Technical Concerns - Projem

## Technical Debt
- **Component Bloat**: Some components like `App.jsx` and styling files like `index.css` / `Quran.css` are becoming very large and may need refactoring.
- **Sync Issues**: Android Gradle synchronization has historically been fragile, often requiring manual `clean` and `sync` operations.

## Security & Reliability
- **Firebase Permissions**: Ensuring Firestore/Storage rules are strictly enforced as the app grows.
- **Integration Stability**: Reliance on external plugins (AdMob, RevenueCat) requires careful version management.

## Performance
- **Asset Size**: The main bundle size should be monitored (currently handled by `bundle:budget` script).
- **Quran/Hadith Data**: Efficient loading and caching of large static datasets (`src/data`) is critical for low-end devices.
