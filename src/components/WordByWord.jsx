/**
 * Re-export proxy — the monolithic WordByWord.jsx (934 lines) has been
 * shredded into Feature-Sliced Design under:
 *
 *   src/domains/quran/wordByWord/
 *   ├── components/
 *   │   ├── WordByWordShell.jsx   (~120 lines, orchestrator)
 *   │   ├── SurahSelector.jsx     (surah grid picker)
 *   │   ├── AyahList.jsx          (verse accordion + word grid)
 *   │   ├── WordDetailPanel.jsx   (word analysis modal)
 *   │   ├── LimitModal.jsx        (pro upgrade modal)
 *   │   └── WordByWord.css        (scoped styles)
 *   └── hooks/
 *       └── useWordByWord.js      (all state + logic)
 *
 * This file exists solely to keep existing import paths working.
 * After all consumers are updated, this file can be deleted.
 */
export { default } from '../domains/quran/wordByWord/components/WordByWordShell';
