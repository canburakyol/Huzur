import React, { useMemo } from 'react';

const mapEnglishToTurkishSource = (label) => {
  if (!label) return '';
  let clean = label.trim();

  // Hadiths
  if (clean.toLowerCase().includes('bukhari')) {
    const num = clean.replace(/[^0-9]/g, '');
    return `Buhari, ${num ? 'Hadis ' + num : clean}`;
  }
  if (clean.toLowerCase().includes('muslim')) {
    const num = clean.replace(/[^0-9]/g, '');
    return `Muslim, ${num ? 'Hadis ' + num : clean}`;
  }

  // Qur'an surahs mapping
  const surahs = {
    'ali \'imran': 'Ali İmran',
    'al-ahzab': 'Ahzab',
    'al-anfal': 'Enfal',
    'al-\'ankabut': 'Ankebut',
    'al-baqarah': 'Bakara',
    'ad-duha': 'Duha',
    'adh-dhariyat': 'Zariyat',
    'al-furqan': 'Furkan',
    'ghafir': 'Mü\'min (Gafir)',
    'al-isra': 'İsra',
    'al-jumu\'ah': 'Cuma',
    'al-kahf': 'Kehf',
    'al-muzzammil': 'Müzzemmil',
    'an-nahl': 'Nahl',
    'qaf': 'Kaf',
    'ar-ra\'d': 'Ra\'d',
    'ash-sharh': 'İnşirah',
    'ta-ha': 'Taha',
    'at-tawbah': 'Tevbe',
    'yunus': 'Yunus',
    'yusuf': 'Yusuf',
    'az-zumar': 'Zümer'
  };

  const lower = clean.toLowerCase();
  for (const [eng, tr] of Object.entries(surahs)) {
    if (lower.includes(eng)) {
      // Extract chapter:verse
      const match = clean.match(/\d+[:\-]\d+/);
      if (match) {
        const parts = match[0].split(/[:\-]/);
        if (parts.length >= 2) {
          return `Diyanet Meal: ${tr} ${parts[1]}`;
        }
      }
      return `Diyanet Meal: ${tr}`;
    }
  }

  return clean;
};

/**
 * Single chat message bubble with suggested actions.
 * Trust / confidence scores and metrics are fully removed from the UI.
 * Validated source references are integrated naturally at the end of the text.
 */
const ChatMessageBubble = ({ msg, onSuggestedAction }) => {
  const isUser = msg.type === 'user';

  const displaySources = useMemo(() => {
    if (isUser || !msg.meta?.sources || msg.meta.sources.length === 0) return '';
    
    // Filter to reviewed sources
    const reviewed = msg.meta.sources.filter(s => s.reviewStatus === 'reviewed');
    if (reviewed.length === 0) return '';

    const formatted = reviewed.map(s => mapEnglishToTurkishSource(s.label)).filter(Boolean);
    if (formatted.length === 0) return '';

    return ` *(${formatted.join(', ')})*`;
  }, [msg.meta?.sources, isUser]);

  return (
    <div
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Bubble */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: isUser ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
          background: isUser ? 'var(--nav-accent)' : 'var(--nav-hover)',
          color: isUser ? 'white' : 'var(--nav-text)',
          fontSize: '1rem',
          lineHeight: '1.6',
          fontWeight: '600',
          border: isUser ? 'none' : '1px solid var(--nav-border)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {msg.text}
        {displaySources}
      </div>

      {/* Suggested Actions */}
      {msg.meta?.suggestedActions?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {msg.meta.suggestedActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onSuggestedAction(action)}
              style={{
                padding: '8px 12px',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.10)',
                color: 'var(--nav-text)',
                border: '1px solid rgba(16, 185, 129, 0.18)',
                fontSize: '0.76rem',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatMessageBubble;
