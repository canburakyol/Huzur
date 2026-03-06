# Phase 2 Context: Premium Design

## Objective
The core objective of Phase 2 is to take the "Huzur" app from a standard UI to a premium, "wow-factor" experience using modern web aesthetics (Glassmorphism, gradients, micro-animations, refined typography) while maintaining the *vibe* of the current theme the user already likes.

## Deep Dive & Decisions

### 1. Theme and Aesthetics
- **User Input:** "I am happy with the current theme."
- **Decision:** Do not reinvent the color wheel. We will keep the primary branding colors (emeralds, golds, deep navies, or whatever is currently in `index.css`), but we will *enhance* them. This means adding depth (shadows, translucent "glass" panels), better typography (e.g., using Outfit or Inter for UI), and subtle hover/active animations.

### 2. Scope Exclusions (STRICT GUARDRAILS)
- **Quran Component:** The user explicitly stated: "Make all categories and components match the theme EXCEPT 'Quran'."
- **Decision:** The `Quran.jsx` component and any related 'Quran' sub-feature (`QuranRadio.jsx`, `QuranMemorize.jsx`, `WordByWord.jsx`, etc.) MUST be completely ignored during the CSS class refactoring. Their current styling is permanently locked.
- **RevenueCat:** Subscriptions are fully integrated. Do not modify the underlying purchasing logic in components like `ProUpgrade.jsx` or any service files. Only *visual UI wrappers* can be touched if necessary, but the core flow is locked.

## Architectural Approach
1. Define a core set of "Premium Tokens" in `index.css` (e.g., `.glass-panel`, `.premium-gradient`, `.smooth-transition`).
2. Sweep through components (`DiscoverFeed`, `HeroPrayerCard`, `Zikirmatik`, etc.) replacing standard rigid borders/backgrounds with these new premium utility classes.
