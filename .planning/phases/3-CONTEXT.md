# Phase 3 Context: Classic Mushaf Redesign

## Objective
The user requested a redesign of the Quran reading page (\Quran.jsx\ and \Quran.css\) to resemble a classic, physical Mushaf. This follows the selection of the "Classic Concept" which features a cream/yellowish paper texture, gold and dark blue intricate borders, and a traditional layout.

## Strict Constraints
1. **Preserve Immersive Mode**: The feature where tapping the screen hides the top and bottom navigation bars MUST be preserved identically. Functionality cannot be broken.
2. **Preserve Core Features**: Audio playback, translation toggling, and bookmarking systems must remain fully intact.
3. **Arabic Font Legibility**: The Arabic text must remain highly legible, utilizing the existing standard Arabic fonts without breaking line heights.
4. **Current Architecture**: We will mainly modify \Quran.css\ and the structural \div\s in \Quran.jsx\ that wrap the text (mushaf-frame, mushaf-paper) to introduce the new theme without replacing the React state logic.