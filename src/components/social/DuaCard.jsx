import { memo } from 'react';

/**
 * Memoized Dua Card Component
 * Prevents unnecessary re-renders when parent list updates
 */
const DuaCard = memo(({ dua, isPrayed, onPray }) => {
  return (
    <div 
      className="glass-card"
      style={{ 
        padding: '20px', 
        border: '1px solid var(--glass-border)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease'
      }}
    >
      <p style={{ 
        margin: '0 0 16px 0', 
        fontSize: '16px', 
        lineHeight: '1.6',
        color: 'var(--text-color)',
        fontFamily: 'var(--font-main)',
        fontStyle: 'italic',
        opacity: 0.9
      }}>
        "{dua.text}"
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-color-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ opacity: 0.7 }}>👤</span> {dua.isAnonymous ? 'Bir Mümin' : dua.authorName}
        </span>
        
        <button 
          onClick={() => onPray(dua.id)}
          disabled={isPrayed}
          style={{
            background: isPrayed ? 'var(--success-color)' : 'rgba(255,255,255,0.05)',
            border: isPrayed ? 'none' : '1px solid var(--primary-color)',
            borderRadius: '20px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: isPrayed ? 'white' : 'var(--primary-color)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isPrayed ? 'default' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isPrayed ? '0 2px 10px rgba(46, 204, 113, 0.3)' : 'none'
          }}
        >
          <span>🤲</span>
          <span>
            {isPrayed ? 'Amin denildi' : 'Amin'} ({dua.aminCount || 0})
          </span>
        </button>
      </div>
    </div>
  );
});

DuaCard.displayName = 'DuaCard';

export default DuaCard;
