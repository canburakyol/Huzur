import { ChevronLeft, ShieldCheck, Info, Eye, Lock, Mail, Server, Sparkles } from 'lucide-react';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import { useTranslation } from 'react-i18next';

function PrivacyPolicy({ onClose }) {
    const { t } = useTranslation();
    return (
        <div className="legal-overlay">
            <div className="settings-container reveal-stagger pb-100">
                {/* Header */}
                <div className="legal-page-header">
                    <IslamicBackButton onClick={onClose} size="medium" />
                    <div className="flex-1">
                        <h2 className="page-title">
                            {t('legal.privacy.title', 'Gizlilik Politikası')}
                        </h2>
                        <p className="nav-section-title">
                            {t('legal.privacy.subtitle', 'Verilerinizin güvenliği ve gizliliği önceliğimizdir')}
                        </p>
                    </div>
                    <div className="settings-icon-box privacy-shield-icon">
                        <ShieldCheck size={20} />
                    </div>
                </div>

                {/* Content */}
                <div className="settings-card legal-content-card">
                    <div className="legal-body">
                        <div className="update-badge mb-24">
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
                                <li><strong>{t('legal.privacy.s1.item1Label', 'Konum Bilgisi:')}</strong> {t('legal.privacy.s1.item1Desc', 'Namaz vakitlerini, hava durumunu, kıble yönünü ve yakın cami özelliklerini çalıştırmak için yaklaşık veya hassas konum kullanılabilir. Konum tercihleriniz cihazınızda saklanır; koordinatlar yalnızca ilgili özelliği çalıştırmak için gerekli olduğunda üçüncü taraf API servislerine gönderilebilir.')}</li>
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
                                {t('legal.privacy.s3.desc', 'Kişisel verileriniz satılmaz. Uygulama, namaz vakitleri için Aladhan API, hava durumu için Open-Meteo API, konum adı çözümleme için BigDataCloud API ve harita/yakın yer özellikleri için harita servisleri kullanabilir. Bu servislerle yalnızca ilgili özelliğin çalışması için gerekli veriler paylaşılır ve bu servislerin kendi gizlilik politikaları geçerlidir.')}
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
                                {t('legal.privacy.s7.desc', 'Dini sorularınızı yanıtlamak için yapay zeka sağlayıcıları ve Huzur backend servisleri kullanılabilir. Sorularınız cevap üretimi için bu servislere gönderilir. Lütfen asistan mesajlarına hassas kişisel bilgi, kimlik bilgisi veya ödeme bilgisi yazmayın.')}
                            </p>
                        </section>

                        <section className="legal-section">
                            <div className="contact-box">
                                <Mail size={20} color="var(--nav-accent)" />
                                <div>
                                    <h3>{t('legal.contact.title', '8. İletişim')}</h3>
                                    <p>{t('legal.contact.desc', 'Gizlilik politikamız hakkında sorularınız için:')}</p>
                                    <strong className="legal-contact-email">huzurapp.destek@gmail.com</strong>
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

                .legal-page-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 32px;
                }

                .privacy-shield-icon {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
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

                .legal-contact-email {
                    color: var(--nav-accent);
                    font-size: 0.9rem;
                }
            `}</style>
        </div>
    );
}

export default PrivacyPolicy;



