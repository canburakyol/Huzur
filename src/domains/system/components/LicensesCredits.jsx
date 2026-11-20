import { ExternalLink, Music, Book, Globe, Code, Heart, AlertTriangle } from 'lucide-react';
import PageHeader from '../../../components/shared/PageHeader';
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
                    description: t('licenses.items.alquranCloud'),
                    url: 'https://alquran.cloud',
                    license: t('licenses.license.openUse')
                },
                {
                    name: 'Islamic Network CDN',
                    description: t('licenses.items.islamicNetwork'),
                    url: 'https://cdn.islamic.network',
                    license: t('licenses.license.openUse')
                },
                {
                    name: 'Açık Kuran API',
                    description: t('licenses.items.acikKuran'),
                    url: 'https://acikkuran.com',
                    license: t('licenses.license.openSource')
                },
                {
                    name: 'Quranic Arabic Corpus',
                    description: t('licenses.items.corpus'),
                    url: 'https://corpus.quran.com',
                    license: 'GNU GPL'
                }
            ]
        },
        {
            category: t('licenses.categories.recitations'),
            icon: <Music size={18} />,
            items: [
                {
                    name: 'Mishary Rashid Alafasy',
                    description: t('licenses.items.alafasy'),
                    license: 'Streaming'
                },
                {
                    name: 'Abdul Basit Abdus-Samad',
                    description: t('licenses.items.classicEgypt'),
                    license: 'Public Domain'
                },
                {
                    name: 'Mahmoud Khalil Al-Husary',
                    description: t('licenses.items.classicEgypt'),
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
                    description: t('licenses.items.aladhan'),
                    url: 'https://aladhan.com',
                    license: t('licenses.license.freeApi')
                },
                {
                    name: 'Diyanet İşleri Başkanlığı',
                    description: t('licenses.items.diyanet'),
                    url: 'https://namazvakitleri.diyanet.gov.tr',
                    license: t('licenses.license.official')
                }
            ]
        },
        {
            category: t('licenses.categories.openSource'),
            icon: <Code size={18} />,
            items: [
                {
                    name: 'React',
                    description: t('licenses.items.react'),
                    url: 'https://react.dev',
                    license: 'MIT'
                },
                {
                    name: 'Vite',
                    description: t('licenses.items.vite'),
                    url: 'https://vitejs.dev',
                    license: 'MIT'
                },
                {
                    name: 'Lucide Icons',
                    description: t('licenses.items.lucide'),
                    url: 'https://lucide.dev',
                    license: 'ISC'
                }
            ]
        }
    ];

    return (
        <div className="settings-container reveal-stagger" style={{ paddingBottom: '100px' }}>
            {/* Header */}
            <PageHeader title={t('licenses.title', 'Lisanslar & Kaynaklar')} subtitle={t('licenses.subtitle')} onBack={onClose} />

            {/* Intro */}
            <div className="settings-card thanks-banner" style={{ marginBottom: '32px', padding: '24px', gap: '16px' }}>
                <div className="heart-box">
                    <Heart size={24} fill="var(--danger)" color="var(--danger)" />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '900', color: 'var(--ink)' }}>
                        {t('licenses.thanks', 'Teşekkürler')}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-muted)', fontWeight: '600', lineHeight: '1.5' }}>
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
                <AlertTriangle size={20} color="var(--gold-ink)" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ink-muted)', fontWeight: '700', lineHeight: '1.6' }}>
                    <span style={{ color: 'var(--gold-ink)', marginRight: '6px' }}>{t('licenses.disclaimer', 'UYARI:')}</span>
                    {t('licenses.disclaimerDesc', 'Uygulama üzerinden sağlanan veriler bilgilendirme amaçlıdır. Önemli dini tercihleriniz için resmi kurumların verilerini teyit etmenizi öneririz.')}
                </p>
            </div>

            <style>{`
                .thanks-banner {
                    background: color-mix(in srgb, var(--danger) 3%, transparent);
                    border: 1px dashed color-mix(in srgb, var(--danger) 20%, transparent);
                    display: flex;
                    align-items: center;
                }

                .heart-box {
                    width: 48px; height: 48px;
                    display: flex; align-items: center; justify-content: center;
                    background: color-mix(in srgb, var(--danger) 10%, transparent);
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
                    border-bottom: 1px solid var(--line);
                    width: 100%;
                }

                .category-icon-box {
                    color: var(--brand-ink);
                    opacity: 0.8;
                }

                .category-title {
                    font-size: 0.75rem;
                    font-weight: 950;
                    color: var(--brand-ink);
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
                    color: var(--ink);
                }

                .item-desc {
                    margin: 0;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--ink-muted);
                }

                .item-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .license-chip {
                    padding: 4px 10px;
                    background: var(--paper-sunken);
                    border: 1px solid var(--line);
                    border-radius: 10px;
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: var(--ink-muted);
                    white-space: nowrap;
                }

                .link-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    border: 1px solid var(--line);
                    border-radius: 8px;
                    color: var(--ink-muted);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .link-btn:hover {
                    color: var(--brand-ink);
                    border-color: var(--brand-ink);
                    background: var(--paper-sunken);
                }

                .disclaimer-banner {
                    padding: 20px;
                    background: color-mix(in srgb, var(--gold) 3%, transparent);
                    border: 1px solid color-mix(in srgb, var(--gold) 20%, transparent);
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
            `}</style>
        </div>
    );
};

export default LicensesCredits;
