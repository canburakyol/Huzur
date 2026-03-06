import { ChevronLeft, Scale, Info, ShieldCheck, HelpCircle } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { useTranslation } from 'react-i18next';

function TermsOfService({ onClose }) {
    const { t } = useTranslation();
    return (
        <div className="legal-overlay">
            <div className="settings-container reveal-stagger" style={{ paddingBottom: '100px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <IslamicBackButton onClick={onClose} size="medium" />
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--nav-text)', fontWeight: '950', letterSpacing: '-0.5px' }}>
                            {t('legal.tos.title', 'Kullanım Koşulları')}
                        </h2>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
                            {t('legal.tos.subtitle', 'Yasal haklarınız ve uygulama kullanım kuralları')}
                        </p>
                    </div>
                    <div className="settings-icon-box" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--nav-accent)' }}>
                        <Scale size={20} />
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
                            <strong>{t('common.appName', 'Huzur')}</strong> {t('legal.tos.intro', 'uygulamasını kullanarak, aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız. Lütfen bu koşulları dikkatle okuyun.')}
                        </p>

                        <section className="legal-section">
                            <h3>{t('legal.tos.s1.title', '1. Kullanım Lisansı')}</h3>
                            <p>
                                {t('legal.tos.s1.desc', 'Bu uygulama, kişisel ve ticari olmayan kullanım için ücretsiz olarak sunulmaktadır. Uygulamayı değiştirmek, kopyalamak veya dağıtmak yasaktır.')}
                            </p>
                        </section>

                        <section className="legal-section">
                            <h3>{t('legal.tos.s2.title', '2. Hizmet Açıklaması')}</h3>
                            <p>
                                {t('legal.tos.s2.desc', 'Huzur uygulaması, namaz vakitleri, Kuran-ı Kerim, dualar ve dini içerikler sağlayan bir mobil uygulamadır. Uygulama, üçüncü taraf API\'ler kullanarak veri sağlar ve bu verilerin doğruluğu garanti edilmez.')}
                            </p>
                        </section>

                        <section className="legal-section">
                            <h3>{t('legal.tos.s3.title', '3. Kullanıcı Sorumlulukları')}</h3>
                            <p>{t('legal.tos.s3.desc', 'Kullanıcılar:')}</p>
                            <ul className="legal-list">
                                <li>{t('legal.tos.s3.item1', 'Uygulamayı yasalara uygun şekilde kullanmalıdır')}</li>
                                <li>{t('legal.tos.s3.item2', 'Uygulamanın içeriğini kötüye kullanmamalıdır')}</li>
                                <li>{t('legal.tos.s3.item3', 'Uygulamayı başkalarının zararına kullanmamalıdır')}</li>
                                <li>{t('legal.tos.s3.item4', 'Uygulamanın güvenliğini tehlikeye atmamalıdır')}</li>
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h3>{t('legal.tos.s4.title', '4. Sorumluluk Reddi')}</h3>
                            <p>
                                {t('legal.tos.s4.desc', 'Uygulama "olduğu gibi" sunulmaktadır. Namaz vakitleri ve diğer bilgilerin doğruluğu için garanti verilmez. Kullanıcılar, önemli dini uygulamalar için resmi kaynaklara başvurmalıdır.')}
                            </p>
                        </section>

                        <section className="legal-section">
                            <h3>{t('legal.tos.s5.title', '5. Fikri Mülkiyet')}</h3>
                            <p>
                                {t('legal.tos.s5.desc', 'Uygulamanın tüm içeriği, tasarımı ve kodları telif hakkı ile korunmaktadır. Kuran-ı Kerim metinleri ve dualar kamu malıdır, ancak uygulamanın kendisi telif hakkı altındadır.')}
                            </p>
                        </section>

                        <section className="legal-section">
                            <h3>{t('legal.tos.s6.title', '6. Hizmet Değişiklikleri')}</h3>
                            <p>
                                {t('legal.tos.s6.desc', 'Uygulama, önceden haber vermeksizin değiştirilebilir, güncellenebilir veya durdururulabilir. Kullanıcılar bu değişikliklerden haberdar olmalıdır.')}
                            </p>
                        </section>

                        <section className="legal-section">
                            <h3>{t('legal.tos.s7.title', '7. İptal ve Fesih')}</h3>
                            <p>
                                {t('legal.tos.s7.desc', 'Uygulama kullanımı, herhangi bir zamanda ve herhangi bir nedenle iptal edilebilir. Kullanıcılar, uygulama koşullarını ihlal ettiklerinde erişimleri sonlandırılabilir.')}
                            </p>
                        </section>

                        <section className="legal-section">
                            <h3>{t('legal.tos.s8.title', '8. Değişiklikler')}</h3>
                            <p>
                                {t('legal.tos.s8.desc', 'Bu kullanım koşulları zaman zaman güncellenebilir. Önemli değişiklikler uygulama içinde bildirilecektir.')}
                            </p>
                        </section>

                        <section className="legal-section">
                            <div className="contact-box">
                                <HelpCircle size={20} color="var(--nav-accent)" />
                                <div>
                                    <h3>{t('legal.contact.title', '9. İletişim')}</h3>
                                    <p>{t('legal.contact.desc', 'Kullanım koşulları hakkında sorularınız için lütfen bizimle iletişime geçin.')}</p>
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

                .legal-section h3 {
                    margin: 0 0 12px 0;
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

                .contact-box {
                    display: flex;
                    gap: 16px;
                    padding: 24px;
                    background: var(--nav-hover);
                    border-radius: 20px;
                    border: 1px solid var(--nav-border);
                }

                .contact-box h3 { margin-bottom: 4px; color: var(--nav-text); }
            `}</style>
        </div>
    );
}

export default TermsOfService;



