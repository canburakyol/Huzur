import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';

function Support({ onClose }) {
    const { t, i18n } = useTranslation();
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
            setError(t('support.errors.messageRequired', 'Please write a message.'));
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Send email using mailto (simple approach)
            // Or use EmailJS/similar service for better experience
            const subject = formData.type === 'problem'
                ? t('support.mail.subjectProblem', 'Huzur App - Problem Report')
                : formData.type === 'feature'
                    ? t('support.mail.subjectFeature', 'Huzur App - Feature Request')
                    : t('support.mail.subjectFeedback', 'Huzur App - Feedback');

            const localeMap = {
                tr: 'tr-TR',
                en: 'en-US',
                ar: 'ar-SA',
                id: 'id-ID',
                es: 'es-ES',
                fr: 'fr-FR',
                de: 'de-DE'
            };
            const dateLocale = localeMap[i18n.language?.split('-')?.[0]] || 'en-US';

            const body = `
${t('support.mail.typeLabel', 'Type')}: ${formData.type === 'problem'
                    ? t('support.types.problem', 'Problem')
                    : formData.type === 'feature'
                        ? t('support.types.feature', 'Feature Request')
                        : t('support.types.other', 'Other')}
${t('support.mail.userEmailLabel', 'User Email')}: ${formData.email || t('support.mail.notSpecified', 'Not specified')}

${t('support.mail.messageLabel', 'Message')}:
${formData.message}

---
${t('support.mail.submittedAtLabel', 'Submitted At')}: ${new Date().toLocaleString(dateLocale)}
${t('support.mail.deviceLabel', 'Device')}: ${navigator.userAgent}
            `;

            // Use mailto for now (works on all platforms)
            const mailtoLink = `mailto:biyokimya58@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            // Try to open email client
            window.location.href = mailtoLink;

            // Show success anyway (email client will handle)
            setSubmitted(true);

        } catch {
            setError(t('support.errors.generic', 'An error occurred. Please try again.'));
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
                    {t('support.successTitle', 'Your request has been submitted!')}
                </h2>
                <p style={{
                    color: 'var(--text-color-muted)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    marginBottom: '32px'
                }}>
                    {t('support.successBodyLine1', 'Thank you for your feedback.')}<br />
                    {t('support.successBodyLine2', 'It will be reviewed as soon as possible.')}
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
                    {t('common.ok', 'OK')}
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
                    💬 {t('support.title', 'Support')}
                </h1>
            </div>

            <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '20px' }}>
                {t('support.description', 'Send us your problems or suggestions')}
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
                        {t('support.typeLabel', 'Notification Type')}
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                            { id: 'problem', label: `🐛 ${t('support.types.problem', 'Problem')}` },
                            { id: 'feature', label: `💡 ${t('support.types.feature', 'Feature Request')}` },
                            { id: 'other', label: `📝 ${t('support.types.other', 'Other')}` }
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
                        {t('support.emailLabel', 'Email (Optional)')}
                    </label>
                    <input
                        type="email"
                        placeholder={t('support.emailPlaceholder', 'example@email.com')}
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
                        {t('support.emailHint', 'Write your email if you want us to get back to you')}
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
                        {t('support.messageLabel', 'Your Message')} *
                    </label>
                    <textarea
                        placeholder={t('support.messagePlaceholder', 'Write your issue or suggestion in detail...')}
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
                    {isSubmitting
                        ? t('support.sending', 'Sending...')
                        : t('support.send', 'Send')}
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
                    {t('support.directContact', 'For direct contact')}: biyokimya58@gmail.com
                </div>
            </div>
        </div>
    );
}

export default Support;
