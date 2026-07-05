import { ChevronLeft } from 'lucide-react';

const IslamicBackButton = ({ onClick, size = 'medium', showLabel = false, label = 'Geri' }) => {
    const sizes = {
        small: { button: 36, icon: 18, font: 12 },
        medium: { button: 44, icon: 22, font: 14 },
        large: { button: 52, icon: 26, font: 16 }
    };
    
    const s = sizes[size] || sizes.medium;
    
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'var(--glass-bg, rgba(255, 255, 255, 0.4))',
                border: '1px solid var(--glass-border, rgba(22, 59, 43, 0.08))',
                borderRadius: showLabel ? '24px' : '50%',
                width: showLabel ? 'auto' : `${s.button}px`,
                height: `${s.button}px`,
                padding: showLabel ? '0 16px 0 8px' : '0',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
                color: 'var(--primary)',
                boxShadow: 'var(--shadow-card, 0 4px 12px rgba(0, 0, 0, 0.05))',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = 'var(--primary)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--on-primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-float, 0 8px 24px rgba(0, 0, 0, 0.15))';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'var(--glass-bg, rgba(255, 255, 255, 0.4))';
                e.currentTarget.style.borderColor = 'var(--glass-border, rgba(22, 59, 43, 0.08))';
                e.currentTarget.style.color = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card, 0 4px 12px rgba(0, 0, 0, 0.05))';
            }}
            onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
            }}
            aria-label={showLabel ? label : 'Geri'}
        >
            {/* Icon */}
            <ChevronLeft 
                size={s.icon} 
                color="currentColor"
                style={{ 
                    position: 'relative',
                    zIndex: 1
                }} 
            />
            
            {/* Label */}
            {showLabel && (
                <span style={{
                    color: 'currentColor',
                    fontSize: `${s.font}px`,
                    fontWeight: '700',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {label}
                </span>
            )}
        </button>
    );
};

export default IslamicBackButton;
