import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import PageHeader from '../../../components/shared/PageHeader';
import { logger } from '../../../utils/logger';

function Support({ onClose }) {
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState({
        type: 'problem', // problem, feature, other
        message: '',
        email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailAppOpened, setEmailAppOpened] = useState(false);
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

            // mailto hands the draft to the user's email app; it does not submit anything.
            setEmailAppOpened(true);

        } catch (error) {
            logger.error('[Support] Failed to launch support mail client', error);
            setError(t('support.errors.generic', 'An error occurred. Please try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // mailto handoff confirmation; no backend submission has occurred.
    if (emailAppOpened) {
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
                    background: 'color-mix(in srgb, var(--success) 20%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px'
                }}>
                    <CheckCircle size={40} color="var(--success)" />
                </div>
                <h2 style={{
                    color: 'var(--brand-ink)',
                    marginBottom: '12px',
                    fontSize: '22px'
                }}>
                    {t('support.emailAppOpenedTitle', 'Email app opened')}
                </h2>
                <p style={{
                    color: 'var(--text-color-muted)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    marginBottom: '32px'
                }}>
                    {t('support.emailAppOpenedBody', 'Review the email and send it to contact support.')}
                </p>
                <button
                    onClick={onClose}
                    style={{
                        padding: '14px 32px',
                        background: 'var(--brand-ink)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'var(--on-primary)',
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
        <div className="app-container" style={{ minHeight: '100vh', paddingBottom: '100px', paddingInline: 'var(--space-4)', boxSizing: 'border-box' }}>
            {/* Header */}
            <div style={{ marginInline: 'calc(-1 * var(--space-4))' }}>
                <PageHeader title={t('support.title', 'Destek')} onBack={onClose} />
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
                        color: 'var(--ink)',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        {t('support.typeLabel', 'Notification Type')}
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                            { id: 'problem', label: t('support.types.problem', 'Problem') },
                            { id: 'feature', label: t('support.types.feature', 'Feature Request') },
                            { id: 'other', label: t('support.types.other', 'Other') }
                        ].map(type => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: formData.type === type.id ? 'var(--brand-ink)' : 'var(--glass-bg)',
                                    border: '1px solid var(--line)',
                                    borderRadius: '10px',
                                    color: formData.type === type.id ? 'var(--on-primary)' : 'var(--ink)',
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
                        color: 'var(--ink)',
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
                            border: '1px solid var(--line)',
                            borderRadius: '12px',
                            color: 'var(--ink)',
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
                        color: 'var(--ink)',
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
                            border: '1px solid var(--line)',
                            borderRadius: '12px',
                            color: 'var(--ink)',
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
                        background: 'color-mix(in srgb, var(--danger) 10%, transparent)',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--danger)',
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
                        background: isSubmitting ? 'color-mix(in srgb, var(--brand-ink) 50%, transparent)' : 'var(--brand-ink)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'var(--on-primary)',
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
                border: '1px solid var(--line)',
                textAlign: 'center'
            }}>
                <MessageSquare size={20} color="var(--text-color-muted)" style={{ margin: '0 auto 8px' }} />
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
