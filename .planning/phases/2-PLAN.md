# Phase 2 Plan: The "Huzur" Design System

## Reference Context
- See `2-CONTEXT.md` for strict guardrails (Do not touch the `Quran` feature components; Do not alter subscription logic).

## Steps for Execution

### Step 1: Establish the "Huzur Premium" Theme Tokens
- **Target:** `src/index.css`
- **Action:** 
  - Enhance existing CSS root variables with subtle gradient definitions.
  - Create global utility classes for the "Wow" factor:
    - `.glass-card`: Translucent background with background-blur (`backdrop-filter`) and a subtle white border.
    - `.hover-lift`: Micro-animation for cards floating up gently on hover/tap.
    - `.premium-text`: Gradient text clipping for headers.
  - Integrate a modern UI font (e.g., `Outfit` or `Inter`) for general UI elements, ensuring Arabic font classes (`font-naskh` etc.) remain untouched.

### Step 2: Redesign the Dashboard / Home Feed
- **Target:** `src/components/DiscoverFeed.jsx`, `src/components/ModernHomeFeed.jsx` (or whichever is the active dashboard), and root layout `src/App.jsx`.
- **Action:**
  - Apply the `.glass-card` and `.hover-lift` to feed items.
  - Ensure the greeting and hero sections utilize the new premium typography and gradient text.

### Step 3: Sweep Secondary Components
- **Target:** `Zikirmatik.jsx`, `PrayerTeacher.jsx`, `FastingTracker.jsx`, `Library.jsx`, `Settings.jsx`, etc.
- **Action:**
  - Replace flat backgrounds with the new design system tokens.
  - Add smooth transitions to modal entry/exit using framer-motion (if installed) or pure CSS animations.
- **CRITICAL EXCLUSION:** Skip all components in `src/components/quran/` or anything named `Quran*.jsx`, `WordByWord.jsx`.

### Step 4: Verification
- Verify the app compiles successfully (`npm run dev`).
- Ensure the Quran tab looks exactly as it did before.
- Ensure the Pro Upgrade page still functions logically while looking better.

## Definition of Done
- `index.css` contains the new premium design tokens.
- All non-Quran components utilize the new tokens.
- The app feels visibly "premium" with glassmorphism and animations.
