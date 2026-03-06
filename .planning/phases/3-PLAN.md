# Phase 3 Plan: Classic Mushaf Redesign

## Step 1: CSS Theme Overhaul (\Quran.css\)
- Update CSS root variables for the Quran container to use classic colors: Cream/beige for the background (\--quran-bg\), deep blue (\--quran-primary\), and rich gold (\--quran-gold\).
- Redesign \.mushaf-frame\ and \.mushaf-paper\ to simulate a physical book. Introduce a border with a geometric or classic double-line style, pairing deep blue bounds with gold inner lines.
- Add a subtle paper texture background to \.mushaf-paper\ using a CSS radial gradient or repeating linear gradient for a vintage feel.
- Restyle \.mushaf-ayah-block\ to elegantly fit the classic theme (removing modern glassmorphism from the reading area itself, making it feel like printed text).
- Redesign the Ayah number badges to look like traditional golden verse markers (end-of-ayah symbols).

## Step 2: Component Structure Updates (\Quran.jsx\)
- Clean up or organize the HTML wrapper within \.quran-scroll-area\ to ensure the \mushaf-frame\ centers correctly like a page.
- Ensure the \onClick={() => setShowBars(!showBars)}\ functionality remains completely untouched on the scroll wrapper.
- Update the Top and Bottom bars to complement the new classic theme (e.g., solid deep blue or dark green with gold accents) instead of the previous dark teal.

## Step 3: Verification
- Build the app and verify the UI matches the classic concept without breaking interactions.