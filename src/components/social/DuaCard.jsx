import { memo } from 'react';

/**
 * Memoized Dua Card Component
 * Prevents unnecessary re-renders when parent list updates
 */
const DuaCard = memo(({ dua, isPrayed, onPray }) => {
  return (
    <div 
      className="glass-card"
      style={{ padding: '15px' }}
    >
      <p style={{ 
        margin: '0 0 10px 0', 
        fontSize: '16px', 
        lineHeight: '1.5',
        color: 'var(--text-color)',
        fontFamily: 'var(--font-main)',
        fontStyle: 'italic'
      }}>
        "{dua.text}"
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
          👤 {dua.isAnonymous ? 'Bir Mümin' : dua.authorName}
        </span>
        
        <button 
          onClick={() => onPray(dua.id)}
          disabled={isPrayed}
          style={{
            background: isPrayed ? 'var(--success-color)' : 'rgba(255,255,255,0.1)',
            border: '1px solid var(--glass-border)',
            borderRadius: '20px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: isPrayed ? 'white' : 'var(--text-color)',
            fontSize: '13px',
            cursor: isPrayed ? 'default' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <span>🤲</span>
          <span style={{ fontWeight: 'bold' }}>
            {isPrayed ? 'Amin denildi' : 'Amin'} ({dua.aminCount || 0})
          </span>
        </button>
      </div>
    </div>
  );
});

DuaCard.displayName = 'DuaCard';

export default DuaCard;
