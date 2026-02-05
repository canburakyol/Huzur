import { memo } from 'react';

/**
 * Memoized Hatim Card Component
 * Prevents unnecessary re-renders when parent list updates
 */
const HatimCard = memo(({ hatim, onClick }) => {
  // Calculate progress
  const getProgress = () => {
    if (!hatim.parts) return 0;
    const total = hatim.totalParts || 30;
    const completed = Object.values(hatim.parts).filter(p => p.status === 'completed').length;
    return Math.round((completed / total) * 100);
  };

  const progress = getProgress();

  return (
    <div 
      className="glass-card clickable"
      onClick={() => onClick(hatim.id)}
      style={{ padding: '15px', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>{hatim.name}</h4>
          <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'var(--text-color-muted)' }}>
            {hatim.description || 'Grup Hatimi'}
          </p>
        </div>
        <div style={{ 
          background: 'rgba(212, 175, 55, 0.2)', 
          padding: '4px 8px', 
          borderRadius: '6px', 
          fontSize: '11px',
          fontWeight: 'bold',
          color: 'var(--primary-color)'
        }}>
          %{progress}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ 
        height: '6px', 
        background: 'rgba(0,0,0,0.1)', 
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          height: '100%', 
          width: `${progress}%`, 
          background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))',
          transition: 'width 0.5s ease'
        }}></div>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-color-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>👥 {hatim.readers?.length || 1} Okuyucu</span>
        <span>Kod: {hatim.joinCode}</span>
      </div>
    </div>
  );
});

HatimCard.displayName = 'HatimCard';

export default HatimCard;
