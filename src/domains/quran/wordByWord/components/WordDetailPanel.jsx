import { Sparkles, Loader } from 'lucide-react';

/**
 * Modal overlay showing word analysis details.
 * Pure presentational — receives all data via props.
 */
const WordDetailPanel = ({ t, selectedWord, wordAnalysis, isAnalyzing, onDismiss }) => {
  if (!selectedWord) return null;

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
              color: 'var(--nav-accent)',
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
        <div className="word-modal-content">
          {isAnalyzing ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Loader className="spin" size={32} color="var(--nav-accent)" />
              <p style={{ marginTop: '16px', color: 'var(--nav-text-muted)', fontWeight: '800' }}>
                {t('wordByWord.analyzing')}
              </p>
            </div>
          ) : (
            wordAnalysis && (
              <div
                className="reveal-stagger"
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <AnalysisRow label="🔤 Okunuş" value={wordAnalysis.transliteration} />
                <AnalysisRow label="📝 Anlam" value={wordAnalysis.meaning} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--nav-text-muted)',
                      fontWeight: '900',
                      textTransform: 'uppercase',
                    }}
                  >
                    ℹ️ Detaylı Analiz
                  </span>
                  <div
                    className="settings-card"
                    style={{
                      padding: '16px',
                      background: 'var(--nav-hover)',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      color: 'var(--nav-text)',
                      fontWeight: '600',
                    }}
                  >
                    {wordAnalysis.details}
                  </div>
                </div>

                <div
                  className="hamburger-level-badge"
                  style={{
                    alignSelf: 'flex-start',
                    background: 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.1)',
                    color: 'var(--nav-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={14} /> {wordAnalysis.status}
                </div>
              </div>
            )
          )}
        </div>

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

/** Small helper row for analysis fields */
const AnalysisRow = ({ label, value }) => (
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
    <div className="settings-card" style={{ padding: '12px 16px', background: 'var(--nav-hover)' }}>
      <span style={{ fontSize: '1rem', color: 'var(--nav-text)', fontWeight: '700' }}>{value}</span>
    </div>
  </div>
);

export default WordDetailPanel;
