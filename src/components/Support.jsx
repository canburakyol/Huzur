import { useState } from 'react';
import { Send, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';

function Support({ onClose }) {
    const [formData, setFormData] = useState({
        type: 'problem', // problem, feature, other
        message: '',
        email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.message.trim()) {
            setError('Lütfen bir mesaj yazın.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Send email using mailto (simple approach)
            // Or use EmailJS/similar service for better experience
            const subject = formData.type === 'problem'
                ? 'Huzur App - Sorun Bildirimi'
                : formData.type === 'feature'
                    ? 'Huzur App - Özellik İsteği'
                    : 'Huzur App - Geri Bildirim';

            const body = `
Tip: ${formData.type === 'problem' ? 'Sorun' : formData.type === 'feature' ? 'Özellik İsteği' : 'Diğer'}
Kullanıcı Email: ${formData.email || 'Belirtilmedi'}

Mesaj:
${formData.message}

---
Gönderilme Tarihi: ${new Date().toLocaleString('tr-TR')}
Cihaz: ${navigator.userAgent}
            `;

            // Use mailto for now (works on all platforms)
            const mailtoLink = `mailto:biyokimya58@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            // Try to open email client
            window.location.href = mailtoLink;

            // Show success anyway (email client will handle)
            setSubmitted(true);

        } catch {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success Screen
    if (submitted) {
        return (
            <div className="app-container" style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '40px'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(46, 204, 113, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px'
                }}>
                    <CheckCircle size={40} color="#2ecc71" />
                </div>
                <h2 style={{
                    color: 'var(--primary-color)',
                    marginBottom: '12px',
                    fontSize: '22px'
                }}>
                    Talebiniz İletildi!
                </h2>
                <p style={{
                    color: 'var(--text-color-muted)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    marginBottom: '32px'
                }}>
                    Geri bildiriminiz için teşekkür ederiz.<br />
                    En kısa sürede incelenecektir.
                </p>
                <button
                    onClick={onClose}
                    style={{
                        padding: '14px 32px',
                        background: 'var(--primary-color)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    Tamam
                </button>
            </div>
        );
    }

    return (
        <div className="app-container" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                paddingTop: '20px'
            }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h1 style={{
                    margin: 0,
                    fontSize: '22px',
                    color: 'var(--primary-color)',
                    fontWeight: '700'
                }}>
                    💬 Destek
                </h1>
            </div>

            <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '20px' }}>
                Sorunlarınızı veya önerilerinizi bize iletin
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                {/* Type Selection */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        color: 'var(--text-color)',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        Bildirim Tipi
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                            { id: 'problem', label: '🐛 Sorun' },
                            { id: 'feature', label: '💡 Öneri' },
                            { id: 'other', label: '📝 Diğer' }
                        ].map(type => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: formData.type === type.id ? 'var(--primary-color)' : 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '10px',
                                    color: formData.type === type.id ? '#fff' : 'var(--text-color)',
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                }}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Email (optional) */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        color: 'var(--text-color)',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        E-posta (Opsiyonel)
                    </label>
                    <input
                        type="email"
                        placeholder="ornek@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: 'var(--text-color)',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-color-muted)' }}>
                        Size geri dönüş yapmamızı istiyorsanız e-postanızı yazın
                    </span>
                </div>

                {/* Message */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        color: 'var(--text-color)',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        Mesajınız *
                    </label>
                    <textarea
                        placeholder="Sorununuzu veya önerinizi detaylı bir şekilde yazın..."
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        rows={6}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: 'var(--text-color)',
                            fontSize: '14px',
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        padding: '12px',
                        background: 'rgba(231, 76, 60, 0.1)',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#e74c3c',
                        fontSize: '13px'
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: isSubmitting ? 'rgba(155, 89, 182, 0.5)' : 'var(--primary-color)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Send size={20} />
                    {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                </button>
            </form>

            {/* Contact Info */}
            <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'var(--glass-bg)',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                textAlign: 'center'
            }}>
                <MessageSquare size={20} color="var(--text-color-muted)" style={{ marginBottom: '8px' }} />
                <div style={{
                    fontSize: '12px',
                    color: 'var(--text-color-muted)'
                }}>
                    Doğrudan iletişim için: biyokimya58@gmail.com
                </div>
            </div>
        </div>
    );
}

export default Support;
