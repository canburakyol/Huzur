import { ExternalLink, Music, Book, Globe, Code, Heart, Info, AlertTriangle, Sparkles } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { useTranslation } from 'react-i18next';

const LicensesCredits = ({ onClose }) => {
    const { t } = useTranslation();

    const openLink = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const sources = [
        {
            category: t('licenses.categories.quranData'),
            icon: <Book size={18} />,
            items: [
                {
                    name: 'Al Quran Cloud API',
                    description: 'Kur\'an metni, mealler ve ses kayıtları',
                    url: 'https://alquran.cloud',
                    license: 'Açık Kullanım'
                },
                {
                    name: 'Islamic Network CDN',
                    description: 'Hafız ses dosyaları dağıtımı',
                    url: 'https://cdn.islamic.network',
                    license: 'Açık Kullanım'
                },
                {
                    name: 'Açık Kuran API',
                    description: 'Türkçe okunuş ve çeviriler',
                    url: 'https://acikkuran.com',
                    license: 'Açık Kaynak'
                }
            ]
        },
        {
            category: t('licenses.categories.recitations'),
            icon: <Music size={18} />,
            items: [
                {
                    name: 'Mishary Rashid Alafasy',
                    description: 'Kuveyt - Al Quran Cloud üzerinden',
                    license: 'Streaming'
                },
                {
                    name: 'Abdul Basit Abdus-Samad',
                    description: 'Mısır - Klasik kayıtlar',
                    license: 'Public Domain'
                },
                {
                    name: 'Mahmoud Khalil Al-Husary',
                    description: 'Mısır - Klasik kayıtlar',
                    license: 'Public Domain'
                }
            ]
        },
        {
            category: t('licenses.categories.prayerTimes'),
            icon: <Globe size={18} />,
            items: [
                {
                    name: 'Aladhan API',
                    description: 'Namaz vakitlerini hesaplama servisi',
                    url: 'https://aladhan.com',
                    license: 'Ücretsiz API'
                },
                {
                    name: 'Diyanet İşleri Başkanlığı',
                    description: 'Türkiye namaz vakitleri referansı',
                    url: 'https://namazvakitleri.diyanet.gov.tr',
                    license: 'Resmi Kaynak'
                }
            ]
        },
        {
            category: t('licenses.categories.openSource'),
            icon: <Code size={18} />,
            items: [
                {
                    name: 'React',
                    description: 'Kullanıcı arayüzü geliştirme',
                    url: 'https://react.dev',
                    license: 'MIT'
                },
                {
                    name: 'Vite',
                    description: 'Build ve geliştirme ortamı',
                    url: 'https://vitejs.dev',
                    license: 'MIT'
                },
                {
                    name: 'Lucide Icons',
                    description: 'İkon kütüphanesi',
                    url: 'https://lucide.dev',
                    license: 'ISC'
                }
            ]
        }
    ];

    return (
        <div className="settings-container reveal-stagger" style={{ paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--nav-text)', fontWeight: '950', letterSpacing: '-0.5px' }}>
                        {t('licenses.title', 'Lisanslar & Kaynaklar')}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
                        Huzur'u mümkün kılan teknoloji ve içerikler
                    </p>
                </div>
                <div className="settings-icon-box" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--nav-accent)' }}>
                    <Info size={20} />
                </div>
            </div>

            {/* Intro */}
            <div className="settings-card thanks-banner" style={{ marginBottom: '32px', padding: '24px', gap: '16px' }}>
                <div className="heart-box">
                    <Heart size={24} fill="#ef4444" color="#ef4444" />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '900', color: 'var(--nav-text)' }}>
                        {t('licenses.thanks', 'Teşekkürler')}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600', lineHeight: '1.5' }}>
                        {t('licenses.thanksDesc', 'Bu uygulamanın geliştirilmesine katkıda bulunan tüm açık kaynak projelerine ve veri sağlayıcılarına teşekkür ederiz.')}
                    </p>
                </div>
            </div>

            {/* Sources List */}
            <div className="sources-list">
              {sources.map((section, sectionIndex) => (
                  <div 
                    key={sectionIndex} 
                    className="settings-card source-section" 
                    style={{ '--delay': `${sectionIndex * 0.1}s`, flexDirection: 'column', gap: '0' }}
                  >
                      <div className="section-header">
                          <div className="category-icon-box">{section.icon}</div>
                          <span className="category-title">{section.category}</span>
                      </div>

                      <div className="items-grid">
                        {section.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="source-item">
                                <div className="item-main">
                                    <div className="item-info">
                                        <h5 className="item-name">{item.name}</h5>
                                        <p className="item-desc">{item.description}</p>
                                    </div>
                                    <div className="item-actions">
                                        <span className="license-chip">{item.license}</span>
                                        {item.url && (
                                            <button className="link-btn" onClick={() => openLink(item.url)}>
                                                <ExternalLink size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                      </div>
                  </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="settings-card disclaimer-banner" style={{ marginTop: '32px' }}>
                <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '700', lineHeight: '1.6' }}>
                    <span style={{ color: '#f59e0b', marginRight: '6px' }}>{t('licenses.disclaimer', 'UYARI:')}</span>
                    {t('licenses.disclaimerDesc', 'Uygulama üzerinden sağlanan veriler bilgilendirme amaçlıdır. Önemli dini tercihleriniz için resmi kurumların verilerini teyit etmenizi öneririz.')}
                </p>
            </div>

            <style>{`
                .thanks-banner {
                    background: rgba(239, 68, 68, 0.03);
                    border: 1px dashed rgba(239, 68, 68, 0.2);
                    display: flex;
                    align-items: center;
                }

                .heart-box {
                    width: 48px; height: 48px;
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(239, 68, 68, 0.1);
                    border-radius: 14px;
                }

                .sources-list { display: flex; flex-direction: column; gap: 16px; }

                .source-section {
                    padding: 24px;
                    animation: reveal 0.5s ease backwards;
                    animation-delay: var(--delay);
                    display: flex;
                }

                @keyframes reveal {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid var(--nav-border);
                    width: 100%;
                }

                .category-icon-box {
                    color: var(--nav-accent);
                    opacity: 0.8;
                }

                .category-title {
                    font-size: 0.75rem;
                    font-weight: 950;
                    color: var(--nav-accent);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .items-grid { display: flex; flex-direction: column; gap: 16px; width: 100%; }

                .source-item {
                    padding: 12px 0;
                }

                .source-item:not(:last-child) {
                    border-bottom: 1px solid var(--nav-border-muted);
                }

                .item-main {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                }

                .item-info { flex: 1; }

                .item-name {
                    margin: 0 0 4px 0;
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: var(--nav-text);
                }

                .item-desc {
                    margin: 0;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--nav-text-muted);
                }

                .item-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .license-chip {
                    padding: 4px 10px;
                    background: var(--nav-hover);
                    border: 1px solid var(--nav-border);
                    border-radius: 10px;
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: var(--nav-text-muted);
                    white-space: nowrap;
                }

                .link-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    border: 1px solid var(--nav-border);
                    border-radius: 8px;
                    color: var(--nav-text-muted);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .link-btn:hover {
                    color: var(--nav-accent);
                    border-color: var(--nav-accent);
                    background: var(--nav-hover);
                }

                .disclaimer-banner {
                    padding: 20px;
                    background: rgba(245, 158, 11, 0.03);
                    border: 1px solid rgba(245, 158, 11, 0.2);
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
            `}</style>
        </div>
    );
};

export default LicensesCredits;
