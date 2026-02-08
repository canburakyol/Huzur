import { memo } from 'react';

/**
 * Memoized Hatim Card Component
 * Prevents unnecessary re-renders when parent list updates
 */
const HatimCard = memo(({ hatim, onClick, isMember }) => {
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
      style={{ 
        padding: '18px', 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid var(--glass-border)',
        transition: 'transform 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h4 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '16px', fontWeight: '700' }}>{hatim.name}</h4>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-color-muted)' }}>
            {hatim.description || 'Grup Hatimi'}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ 
            background: 'rgba(212, 175, 55, 0.15)', 
            padding: '4px 10px', 
            borderRadius: '8px', 
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'var(--secondary-color)',
            border: '1px solid rgba(212, 175, 55, 0.3)'
          }}>
            %{progress}
          </div>
          <div style={{ 
            fontSize: '10px', 
            padding: '2px 8px', 
            borderRadius: '4px',
            background: isMember ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            color: isMember ? 'var(--success-color)' : 'var(--text-color-muted)',
            border: `1px solid ${isMember ? 'var(--success-color)' : 'var(--glass-border)'}`,
            fontWeight: 'bold'
          }}>
            {isMember ? '✓ Katıldınız' : '🔒 Kod Gerekli'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ 
        height: '8px', 
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '12px'
      }}>
        <div style={{ 
          height: '100%', 
          width: `${progress}%`, 
          background: 'linear-gradient(90deg, var(--secondary-color), #fcd34d)',
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.4)',
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}></div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-color-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>👥</span>
          <span>{hatim.readers?.length || 1} Okuyucu</span>
        </div>
        {isMember ? (
          <div style={{ 
            fontSize: '11px', 
            color: 'var(--primary-color)', 
            background: 'rgba(16, 185, 129, 0.1)', 
            padding: '2px 8px', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontWeight: 'bold'
          }}>
            {hatim.joinCode}
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: 'var(--text-color-muted)', fontStyle: 'italic' }}>
            Katılmak için dokunun
          </div>
        )}
      </div>
    </div>
  );
});

HatimCard.displayName = 'HatimCard';

export default HatimCard;
