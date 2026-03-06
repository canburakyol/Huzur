import { ChevronLeft, ShieldCheck, Info, Eye, Lock, Mail, Server, Sparkles } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { useTranslation } from 'react-i18next';

function PrivacyPolicy({ onClose }) {
    const { t } = useTranslation();
    return (
        <div className="legal-overlay">
            <div className="settings-container reveal-stagger" style={{ paddingBottom: '100px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <IslamicBackButton onClick={onClose} size="medium" />
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--nav-text)', fontWeight: '950', letterSpacing: '-0.5px' }}>
                            {t('legal.privacy.title', 'Gizlilik Politikası')}
                        </h2>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
                            {t('legal.privacy.subtitle', 'Verilerinizin güvenliği ve gizliliği önceliğimizdir')}
                        </p>
                    </div>
                    <div className="settings-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <ShieldCheck size={20} />
                    </div>
                </div>

                {/* Content */}
                <div className="settings-card legal-content-card">
                    <div className="legal-body">
                        <div className="update-badge" style={{ marginBottom: '24px' }}>
                            <Info size={14} />
                            <span>{t('legal.lastUpdate', 'Son Güncelleme')}: {new Date().toLocaleDateString('tr-TR')}</span>
                        </div>
                        
                        <p className="intro-text">
                            <strong>{t('common.appName', 'Huzur')}</strong> {t('legal.privacy.intro', 'uygulaması olarak, kullanıcılarımızın gizliliğine önem veriyoruz. Bu gizlilik politikası, verilerinizin nasıl toplandığını ve korunduğunu açıklamaktadır.')}
                        </p>

                        <section className="legal-section">
                            <div className="section-header">
                                <Eye size={18} />
                                <h3>{t('legal.privacy.s1.title', '1. Toplanan Veriler')}</h3>
                            </div>
                            <p>{t('legal.privacy.s1.desc', 'Uygulamamız aşağıdaki verileri toplayabilir:')}</p>
                            <ul className="legal-list">
                                <li><strong>{t('legal.privacy.s1.item1Label', 'Konum Bilgisi:')}</strong> {t('legal.privacy.s1.item1Desc', 'Namaz vakitlerini ve hava durumunu doğru göstermek için konum bilgisi kullanılır. Bu bilgi sadece cihazınızda saklanır ve sunucularımıza gönderilmez.')}</li>
                                <li><strong>{t('legal.privacy.s1.item2Label', 'Cihaz Bilgileri:')}</strong> {t('legal.privacy.s1.item2Desc', 'Uygulamanın düzgün çalışması için temel cihaz bilgileri kullanılabilir.')}</li>
                            </ul>
                        </section>

                        <section className="legal-section">
                            <div className="section-header">
                                <Sparkles size={18} />
                                <h3>{t('legal.privacy.s2.title', '2. Veri Kullanımı')}</h3>
                            </div>
                            <p>{t('legal.privacy.s2.desc', 'Toplanan veriler sadece aşağıdaki amaçlar için kullanılır:')}</p>
                            <ul className="legal-list">
                                <li>{t('legal.privacy.s2.item1', 'Namaz vakitlerini doğru göstermek')}</li>
                                <li>{t('legal.privacy.s2.item2', 'Hava durumu bilgisi sağlamak')}</li>
                                <li>{t('legal.privacy.s2.item3', 'Kıble yönünü belirlemek')}</li>
                                <li>{t('legal.privacy.s2.item4', 'Uygulama performansını iyileştirmek')}</li>
                            </ul>
                        </section>

                        <section className="legal-section">
                            <div className="section-header">
                                <Server size={18} />
                                <h3>{t('legal.privacy.s3.title', '3. Veri Paylaşımı')}</h3>
                            </div>
                            <p>
                                {t('legal.privacy.s3.desc', 'Kişisel verileriniz üçüncü taraflarla paylaşılmaz. Uygulama, namaz vakitleri için Aladhan API, hava durumu için Open-Meteo API ve konum bilgisi için BigDataCloud API kullanır. Bu servislerin kendi gizlilik politikaları geçerlidir.')}
                            </p>
                        </section>

                        <section className="legal-section">
                            <div className="section-header">
                                <Lock size={18} />
                                <h3>{t('legal.privacy.s4.title', '4. Veri Güvenliği')}</h3>
                            </div>
                            <p>
                                {t('legal.privacy.s4.desc', 'Verileriniz cihazınızda güvenli bir şekilde saklanır. Uygulama, hassas bilgileri şifreleme teknolojileri ile korur.')}
                            </p>
                        </section>

                        <section className="legal-section">
                            <h3>{t('legal.privacy.s5.title', '5. İzinler')}</h3>
                            <ul className="legal-list">
                                <li><strong>{t('legal.privacy.permission.location', 'Konum:')}</strong> {t('legal.privacy.permission.locationDesc', 'Namaz vakitleri ve hava durumu için')}</li>
                                <li><strong>{t('legal.privacy.permission.notification', 'Bildirimler:')}</strong> {t('legal.privacy.permission.notificationDesc', 'Namaz vakitleri hatırlatmaları için')}</li>
                                <li><strong>{t('legal.privacy.permission.internet', 'İnternet:')}</strong> {t('legal.privacy.permission.internetDesc', 'API verilerini almak için')}</li>
                            </ul>
                        </section>

                        <section className="legal-section highlight-box">
                            <h3>{t('legal.privacy.s6.title', '6. Reklam ve Analiz')}</h3>
                            <p>
                                {t('legal.privacy.s6.desc', 'Uygulamamız Google AdMob reklam hizmeti ve Google Firebase Analytics kullanır. Bu hizmetler, kişiselleştirilmiş reklamlar sunmak ve uygulama kullanımını analiz etmek için cihaz tanımlayıcılarını (GAID) toplayabilir.')}
                            </p>
                        </section>

                        <section className="legal-section highlight-box">
                            <div className="section-header">
                                <Sparkles size={18} color="var(--nav-accent)" />
                                <h3>{t('legal.privacy.s7.title', '7. Yapay Zeka Asistan')}</h3>
                            </div>
                            <p>
                                {t('legal.privacy.s7.desc', 'Dini sorularınızı yanıtlamak için Pollinations AI servisi kullanılmaktadır. Sorularınız bu servise gönderilir ve cevaplar alınır. Lütfen bu servise kişisel bilgilerinizi girmekten kaçının.')}
                            </p>
                        </section>

                        <section className="legal-section">
                            <div className="contact-box">
                                <Mail size={20} color="var(--nav-accent)" />
                                <div>
                                    <h3>{t('legal.contact.title', '8. İletişim')}</h3>
                                    <p>{t('legal.contact.desc', 'Gizlilik politikamız hakkında sorularınız için:')}</p>
                                    <strong style={{ color: 'var(--nav-accent)', fontSize: '0.9rem' }}>huzurapp.destek@gmail.com</strong>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <style>{`
                .legal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: var(--nav-bg);
                    z-index: 1000;
                    overflow-y: auto;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .legal-content-card {
                    flex-direction: column;
                    padding: 32px;
                    background: var(--nav-bg);
                    border: 1px solid var(--nav-border);
                    border-radius: 24px;
                }

                .legal-body {
                    line-height: 1.8;
                    color: var(--nav-text);
                }

                .update-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    background: var(--nav-hover);
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: var(--nav-accent);
                    border: 1px solid var(--nav-border);
                }

                .intro-text {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 32px;
                    color: var(--nav-text);
                }

                .legal-section {
                    margin-bottom: 32px;
                    animation: reveal 0.5s ease backwards;
                    animation-delay: 0.2s;
                }

                @keyframes reveal {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 12px;
                    color: var(--nav-accent);
                }

                .legal-section h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 900;
                    color: var(--nav-accent);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .legal-section p {
                    margin: 0;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: var(--nav-text-muted);
                }

                .legal-list {
                    padding-left: 20px;
                    margin: 12px 0 0 0;
                    color: var(--nav-text-muted);
                    font-weight: 600;
                }

                .legal-list li { margin-bottom: 4px; }

                .highlight-box {
                    padding: 24px;
                    background: var(--nav-hover);
                    border-radius: 20px;
                    border: 1px solid var(--nav-border);
                }

                .contact-box {
                    display: flex;
                    gap: 16px;
                    padding: 24px;
                    background: var(--nav-hover);
                    border-radius: 20px;
                    border: 2px dashed var(--nav-accent);
                }

                .contact-box h3 { margin-bottom: 4px; color: var(--nav-text); }
            `}</style>
        </div>
    );
}

export default PrivacyPolicy;



