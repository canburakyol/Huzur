import { describeMorphology, MORPHOLOGY_SOURCE_URL } from '../../../../data/wordMorphology';

/**
 * Modal overlay showing word analysis details.
 * Pure presentational — receives all data via props.
 */
const WordDetailPanel = ({ t, selectedWord, wordAnalysis, onDismiss }) => {
  if (!selectedWord) return null;

  const morphology = wordAnalysis?.morphology;
  const described = morphology ? describeMorphology(morphology, t) : null;
  const arabicStyle = { fontFamily: 'var(--arabic-font-family)', fontSize: '1.4rem', direction: 'rtl' };

  return (
    <div className="word-modal-overlay">
      <div
        className="reveal-stagger"
        style={{
          background: 'var(--nav-bg)',
          borderRadius: '32px',
          padding: '32px 24px',
          maxWidth: '400px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
          border: '1px solid var(--nav-border)',
          animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '24px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--nav-border)',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '2.5rem',
              fontFamily: 'var(--arabic-font-family)',
              color: 'var(--brand-ink)',
              marginBottom: '8px',
            }}
          >
            {selectedWord.arabic}
          </span>
          <span style={{ fontSize: '1.1rem', color: 'var(--nav-text)', fontWeight: '900' }}>
            {selectedWord.meaning}
          </span>
        </div>

        {/* Content */}
        {wordAnalysis && (
          <div className="word-modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AnalysisRow label={t('wordByWord.labels.pronunciation', 'Okunuş')}>{wordAnalysis.transliteration}</AnalysisRow>

            {described ? (
              <>
                {morphology.root && (
                  <AnalysisRow label={t('wordByWord.labels.root', 'Kök')}>
                    <span style={arabicStyle}>{morphology.root}</span>
                    <Muted>{t('wordByWord.occurrences', "Kur'an'da {{count}} kez", { count: morphology.rootCount })}</Muted>
                  </AnalysisRow>
                )}
                {morphology.lemma && (
                  <AnalysisRow label={t('wordByWord.labels.lemma', 'Sözlük biçimi')}>
                    <span style={arabicStyle}>{morphology.lemma}</span>
                    <Muted>{t('wordByWord.occurrences', "Kur'an'da {{count}} kez", { count: morphology.lemmaCount })}</Muted>
                  </AnalysisRow>
                )}
                <AnalysisRow label={t('wordByWord.labels.pos', 'Kelime türü')}>{described.pos}</AnalysisRow>
                {described.grammar.length > 0 && (
                  <AnalysisRow label={t('wordByWord.labels.grammar', 'Dilbilgisi')}>{described.grammar.join(', ')}</AnalysisRow>
                )}
                {described.affixes.length > 0 && (
                  <AnalysisRow label={t('wordByWord.labels.affixes', 'Bitişik ekler')}>{described.affixes.join(', ')}</AnalysisRow>
                )}
                {morphology.related?.length > 0 && (
                  <AnalysisRow label={t('wordByWord.labels.related', 'Aynı kökten')}>
                    <span style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', direction: 'rtl' }}>
                      {morphology.related.map(([lemma, count]) => (
                        <span key={lemma}>
                          <span style={arabicStyle}>{lemma}</span> <Muted>({count})</Muted>
                        </span>
                      ))}
                    </span>
                  </AnalysisRow>
                )}
                <a
                  href={MORPHOLOGY_SOURCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}
                >
                  {t('wordByWord.morphSource', 'Kaynak: Quranic Arabic Corpus')} (corpus.quran.com)
                </a>
              </>
            ) : (
              <Muted>{t('wordByWord.noMorphology', 'Bu kelime için dilbilgisi verisi yok.')}</Muted>
            )}
          </div>
        )}

        <button
          className="velocity-target-btn"
          style={{ width: '100%', marginTop: '32px', justifyContent: 'center' }}
          onClick={onDismiss}
        >
          {t('wordByWord.close')}
        </button>
      </div>
    </div>
  );
};

const Muted = ({ children }) => (
  <span style={{ fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>{children}</span>
);

/** Small helper row for analysis fields */
const AnalysisRow = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <span
      style={{
        fontSize: '0.75rem',
        color: 'var(--nav-text-muted)',
        fontWeight: '900',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
    <div
      className="settings-card"
      style={{ padding: '12px 16px', background: 'var(--nav-hover)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '1rem', color: 'var(--nav-text)', fontWeight: '700' }}
    >
      {children}
    </div>
  </div>
);

export default WordDetailPanel;
