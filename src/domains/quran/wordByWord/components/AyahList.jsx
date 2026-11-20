import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Ayah accordion list with expandable word-by-word grid.
 * Pure presentational component.
 */
const AyahList = ({ t, surahData, expandedAyah, onToggleAyah, onWordClick }) => {
  if (!surahData) return null;

  return (
    <>
      <div className="practice-summary wbw-surah-head">
        <div className="wbw-surah-head__arabic" lang="ar">{surahData.arabicName}</div>
        <div className="practice-row__text">
          {surahData.meaning} · {t('wordByWord.ayahCount', { count: surahData.ayahCount })}
        </div>
      </div>

      <div className="practice-list">
        {surahData.verses.map((verse) => {
          const isOpen = expandedAyah === verse.number;
          return (
            <div key={verse.number} className={`wbw-ayah ${isOpen ? 'wbw-ayah--open' : ''}`}>
              <button
                type="button"
                className="wbw-ayah__head"
                aria-expanded={isOpen}
                onClick={() => onToggleAyah(verse.number)}
              >
                <span className="practice-row__icon">{verse.number}</span>
                <span className="wbw-ayah__arabic" lang="ar" dir="rtl">{verse.arabic}</span>
                {isOpen ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
              </button>

              {isOpen && (
                <div className="wbw-words">
                  {verse.words.map((word, i) => (
                    <button
                      key={i}
                      type="button"
                      className="wbw-word"
                      onClick={() => onWordClick(word, verse.number, i + 1)}
                      aria-label={`${word.arabic} — ${word.meaning}. ${t('wordByWord.analyze')}`}
                    >
                      <span className="wbw-word__arabic" lang="ar">{word.arabic}</span>
                      <span className="wbw-word__meaning">{word.meaning}</span>
                      <span className="wbw-word__latin">{word.transliteration}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default AyahList;
