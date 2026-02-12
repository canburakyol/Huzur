import { ExternalLink, Music, Book, Globe, Code, Heart } from 'lucide-react';
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
            icon: <Book size={20} color="var(--primary-color)" />,
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
            icon: <Music size={20} color="var(--primary-color)" />,
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
                },
                {
                    name: 'Abdurrahman As-Sudais',
                    description: 'Suudi Arabistan - Harem-i Şerif İmamı',
                    license: 'Streaming'
                },
                {
                    name: 'Saud Al-Shuraim',
                    description: 'Suudi Arabistan - Harem-i Şerif İmamı',
                    license: 'Streaming'
                },
                {
                    name: 'Maher Al-Muaiqly',
                    description: 'Suudi Arabistan - Harem-i Şerif İmamı',
                    license: 'Streaming'
                }
            ]
        },
        {
            category: t('licenses.categories.prayerTimes'),
            icon: <Globe size={20} color="var(--primary-color)" />,
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
            icon: <Code size={20} color="var(--primary-color)" />,
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
                },
                {
                    name: 'i18next',
                    description: 'Çoklu dil desteği',
                    url: 'https://i18next.com',
                    license: 'MIT'
                }
            ]
        }
    ];

    return (
        <div className="app-container" style={{ 
            minHeight: '100vh', 
            paddingBottom: '40px',
            background: 'var(--bg-gradient-start)'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                paddingTop: 'calc(20px + env(safe-area-inset-top))',
                paddingLeft: '16px'
            }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h1 style={{
                    margin: 0,
                    fontSize: '20px',
                    color: 'var(--text-color)',
                    fontWeight: '700'
                }}>
                    📜 {t('licenses.title')}
                </h1>
            </div>

            {/* Intro */}
            <div className="glass-card" style={{ 
                margin: '0 16px 16px', 
                padding: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Heart size={18} color="#e74c3c" />
                    <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                        {t('licenses.thanks')}
                    </span>
                </div>
                <p style={{ 
                    fontSize: '13px', 
                    color: 'var(--text-color-muted)', 
                    margin: 0,
                    lineHeight: '1.6'
                }}>
                    {t('licenses.thanksDesc')}
                </p>
            </div>

            {/* Sources */}
            <div style={{ padding: '0 16px' }}>
              {sources.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="glass-card" style={{ marginBottom: '12px', padding: '16px' }}>
                      <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px', 
                          marginBottom: '14px',
                          paddingBottom: '10px',
                          borderBottom: '1px solid var(--glass-border)'
                      }}>
                          {section.icon}
                          <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-color)' }}>
                              {section.category}
                          </span>
                      </div>

                      {section.items.map((item, itemIndex) => (
                          <div 
                              key={itemIndex}
                              style={{ 
                                  padding: '10px 0',
                                  borderBottom: itemIndex < section.items.length - 1 ? '1px solid var(--glass-border)' : 'none'
                              }}
                          >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ flex: 1 }}>
                                      <div style={{ 
                                          fontWeight: '600', 
                                          fontSize: '14px', 
                                          color: 'var(--primary-color)',
                                          marginBottom: '2px'
                                      }}>
                                          {item.name}
                                      </div>
                                      <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
                                          {item.description}
                                      </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{
                                          fontSize: '11px',
                                          padding: '3px 8px',
                                          background: 'rgba(212, 175, 55, 0.1)',
                                          color: 'var(--primary-color)',
                                          borderRadius: '10px',
                                          fontWeight: '500'
                                      }}>
                                          {item.license}
                                      </span>
                                      {item.url && (
                                          <button
                                              onClick={() => openLink(item.url)}
                                              style={{
                                                  background: 'none',
                                                  border: 'none',
                                                  cursor: 'pointer',
                                                  padding: '4px',
                                                  color: 'var(--text-color-muted)'
                                              }}
                                          >
                                              <ExternalLink size={14} />
                                          </button>
                                      )}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="glass-card" style={{ 
                margin: '12px 16px',
                padding: '14px',
                background: 'rgba(231, 76, 60, 0.05)',
                border: '1px solid rgba(231, 76, 60, 0.2)'
            }}>
                <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-color-muted)',
                    lineHeight: '1.6'
                }}>
                    <strong style={{ color: '#e74c3c' }}>⚠️ {t('licenses.disclaimer')}</strong> 
                    {' '}{t('licenses.disclaimerDesc')}
                </div>
            </div>
        </div>

    );
};

export default LicensesCredits;
