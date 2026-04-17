import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

/**
 * Ayah accordion list with expandable word-by-word grid.
 * Pure presentational component.
 */
const AyahList = ({ t, surahData, expandedAyah, onToggleAyah, onWordClick }) => {
  if (!surahData) return null;

  return (
    <div style={{ padding: '0 20px 40px 20px' }} className="reveal-stagger">
      {/* Surah title card */}
      <div
        className="settings-card"
        style={{
          flexDirection: 'column',
          padding: '32px 24px',
          textAlign: 'center',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, var(--nav-bg), var(--nav-hover))',
        }}
      >
        <div
          style={{
            fontSize: '2.5rem',
            fontFamily: 'var(--arabic-font-family)',
            color: 'var(--nav-accent)',
            marginBottom: '12px',
          }}
        >
          {surahData.arabicName}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: 'var(--nav-text-muted)',
            fontWeight: '800',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: 'var(--nav-text)' }}>{surahData.name}</span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span>{surahData.meaning}</span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span className="hamburger-level-badge">
            {t('wordByWord.ayahCount', { count: surahData.ayahCount })}
          </span>
        </div>
      </div>

      {/* Verse list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {surahData.verses.map((verse, vIdx) => (
          <div
            key={verse.number}
            className={`settings-card reveal-stagger ${expandedAyah === verse.number ? 'expanded' : ''}`}
            style={{
              padding: '0',
              flexDirection: 'column',
              '--delay': `${vIdx * 0.1}s`,
              border:
                expandedAyah === verse.number
                  ? '1px solid var(--nav-accent)'
                  : '1px solid var(--nav-border)',
            }}
          >
            {/* Ayah header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                cursor: 'pointer',
              }}
              onClick={() => onToggleAyah(verse.number)}
            >
              <div
                className="settings-icon-box"
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--nav-accent)',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: '900',
                  borderRadius: '50%',
                }}
              >
                {verse.number}
              </div>
              <div
                style={{
                  flex: 1,
                  fontSize: '1.25rem',
                  fontFamily: 'var(--arabic-font-family)',
                  lineHeight: '1.8',
                  textAlign: 'right',
                  direction: 'rtl',
                  color: 'var(--nav-text)',
                }}
              >
                {verse.arabic}
              </div>
              <div style={{ color: 'var(--nav-text-muted)' }}>
                {expandedAyah === verse.number ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {/* Word grid (expanded) */}
            {expandedAyah === verse.number && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                  gap: '12px',
                  padding: '20px',
                  background: 'var(--nav-hover)',
                  borderTop: '1px solid var(--nav-border)',
                  animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {verse.words.map((word, i) => (
                  <div
                    key={i}
                    className="settings-card"
                    style={{
                      padding: '12px',
                      flexDirection: 'column',
                      textAlign: 'center',
                      gap: '4px',
                      borderRadius: '16px',
                      cursor: 'pointer',
                    }}
                    onClick={() => onWordClick(word)}
                  >
                    <div style={{ fontWeight: '900', fontSize: '0.85rem', color: 'var(--nav-text)' }}>
                      {word.meaning}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--nav-text-muted)', fontStyle: 'italic' }}>
                      {word.transliteration}
                    </div>
                    <div
                      style={{
                        fontSize: '1.5rem',
                        fontFamily: 'var(--arabic-font-family)',
                        color: 'var(--nav-accent)',
                        marginTop: '4px',
                      }}
                    >
                      {word.arabic}
                    </div>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: 'var(--nav-accent)',
                        marginTop: '8px',
                        fontWeight: '900',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        opacity: 0.8,
                      }}
                    >
                      <Sparkles size={10} />
                      {t('wordByWord.analyze')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AyahList;
