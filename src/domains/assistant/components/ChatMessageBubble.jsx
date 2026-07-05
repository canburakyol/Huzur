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
      const match = clean.match(/\d+[:-]\d+/);
      if (match) {
        const parts = match[0].split(/[:-]/);
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
  const sources = msg.meta?.sources;

  const displaySourcesList = useMemo(() => {
    if (isUser || !sources || sources.length === 0) return null;
    
    // Filter to reviewed sources
    const reviewed = sources.filter(s => s.reviewStatus === 'reviewed');
    if (reviewed.length === 0) return null;

    const formatted = reviewed.map(s => mapEnglishToTurkishSource(s.label)).filter(Boolean);
    if (formatted.length === 0) return null;

    return formatted.join(', ');
  }, [sources, isUser]);

  return (
    <div className={`assistant-bubble-container ${isUser ? 'assistant-bubble-user' : 'assistant-bubble-bot'}`}>
      {/* Bubble */}
      <div className="assistant-bubble">
        {msg.text}
        {displaySourcesList && (
          <span className="assistant-source-ref">
            Kaynak: {displaySourcesList}
          </span>
        )}
      </div>

      {/* Suggested Actions */}
      {msg.meta?.suggestedActions?.length > 0 && (
        <div className="assistant-tag-container">
          {msg.meta.suggestedActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onSuggestedAction(action)}
              className="assistant-tag-btn"
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
