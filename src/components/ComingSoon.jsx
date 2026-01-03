import { ArrowLeft } from 'lucide-react';

// Generic placeholder component for features under development
function ComingSoon({ onClose, title, icon }) {
    return (
        <div className="app-container" style={{ minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                paddingTop: '20px'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        color: 'var(--primary-color)'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{
                    margin: 0,
                    fontSize: '20px',
                    color: 'var(--primary-color)',
                    fontWeight: '600'
                }}>
                    {icon} {title}
                </h1>
            </div>

            {/* Coming Soon Content */}
            <div className="glass-card" style={{
                textAlign: 'center',
                padding: '60px 24px'
            }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚧</div>
                <h2 style={{
                    color: 'var(--primary-color)',
                    marginBottom: '12px',
                    fontSize: '24px'
                }}>
                    Yakında Geliyor
                </h2>
                <p style={{
                    color: 'var(--text-color-muted)',
                    fontSize: '14px',
                    maxWidth: '280px',
                    margin: '0 auto',
                    lineHeight: '1.6'
                }}>
                    Bu özellik üzerinde çalışıyoruz. Çok yakında sizlerle buluşacak!
                </p>
            </div>

            {/* Feature Description */}
            <div className="glass-card" style={{ marginTop: '20px' }}>
                <h3 style={{
                    color: 'var(--primary-color)',
                    marginBottom: '12px',
                    fontSize: '16px'
                }}>
                    {title} Hakkında
                </h3>
                <p style={{
                    color: 'var(--text-color)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    margin: 0
                }}>
                    Bu bölümde sizler için özel içerikler hazırlıyoruz.
                    Güncellemeler için bildirimleri açık tutun!
                </p>
            </div>
        </div>
    );
}

export default ComingSoon;
