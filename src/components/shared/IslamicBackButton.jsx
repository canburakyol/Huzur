import { ChevronLeft } from 'lucide-react';

/**
 * Islamic-styled Back Button Component
 * Golden star design with Islamic geometric patterns
 */
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
                gap: '8px',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(218, 165, 32, 0.25) 100%)',
                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                borderRadius: showLabel ? '24px' : '50%',
                width: showLabel ? 'auto' : `${s.button}px`,
                height: `${s.button}px`,
                padding: showLabel ? '0 16px 0 8px' : '0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(212, 175, 55, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(212, 175, 55, 0.35)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 175, 55, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
            }}
        >
            {/* Islamic geometric pattern overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.15,
                background: `
                    radial-gradient(circle at 20% 20%, #d4af37 1px, transparent 1px),
                    radial-gradient(circle at 80% 80%, #d4af37 1px, transparent 1px),
                    radial-gradient(circle at 50% 50%, #d4af37 0.5px, transparent 0.5px)
                `,
                backgroundSize: '12px 12px, 12px 12px, 8px 8px',
                pointerEvents: 'none'
            }} />
            
            {/* Star accent */}
            <div style={{
                position: 'absolute',
                top: '3px',
                right: showLabel ? '8px' : '3px',
                fontSize: '8px',
                opacity: 0.6,
                pointerEvents: 'none'
            }}>
                ✦
            </div>
            
            {/* Icon */}
            <ChevronLeft 
                size={s.icon} 
                color="#d4af37"
                style={{ 
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
                    position: 'relative',
                    zIndex: 1
                }} 
            />
            
            {/* Label */}
            {showLabel && (
                <span style={{
                    color: '#d4af37',
                    fontSize: `${s.font}px`,
                    fontWeight: '600',
                    position: 'relative',
                    zIndex: 1,
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}>
                    {label}
                </span>
            )}
        </button>
    );
};

export default IslamicBackButton;
