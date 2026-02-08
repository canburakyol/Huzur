import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Compass, Fingerprint, Sun, Brain, Users, Heart, 
  Moon, BookOpen, Radio, MapPin, Clock, Star, 
  MessageCircle, Sparkles, Zap
} from 'lucide-react';
import './BentoDashboard.css';

const BentoDashboard = ({ onSelectFeature, timings, nextPrayer, dailyContent }) => {
  const { t } = useTranslation();

  // Determine context: is prayer soon? (less than 30 mins)
  const isPrayerSoon = useMemo(() => {
    if (!timings || !nextPrayer) return false;
    const now = new Date();
    const [h, m] = timings[nextPrayer.key].split(':').map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(h, m, 0);
    if (prayerTime < now) prayerTime.setDate(prayerTime.getDate() + 1);
    
    const diffMins = (prayerTime - now) / (1000 * 60);
    return diffMins > 0 && diffMins < 30;
  }, [timings, nextPrayer]);

  const items = [
    // 1. Countdown / Vakit (contextual size)
    {
      id: 'countdown',
      size: isPrayerSoon ? 'bento-4x2' : 'bento-2x2',
      type: 'prayer',
      highlight: isPrayerSoon,
      content: (
        <div className="bento-content">
          <div className="bento-tag">{t('prayer.next')}</div>
          <div className="bento-title" style={{ fontSize: isPrayerSoon ? '24px' : '18px' }}>
            {nextPrayer?.name} {timings?.[nextPrayer?.key]}
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} />
            <span style={{ fontSize: '12px' }}>{isPrayerSoon ? t('countdown.rush') : t('countdown.remaining')}</span>
          </div>
        </div>
      )
    },
    // 2. Daily Verse / Quote (Medium)
    {
      id: 'daily-verse',
      size: 'bento-2x2',
      type: 'content',
      onClick: () => onSelectFeature('quran'),
      content: (
        <div className="bento-content">
          <div className="bento-tag">{t('home.dailyVerse')}</div>
          <p style={{ fontSize: '13px', margin: '8px 0', opacity: 0.8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
             {dailyContent?.verse?.text || t('loading')}
          </p>
          <div className="bento-icon" style={{ marginTop: 'auto', background: 'rgba(212, 175, 55, 0.1)' }}>
            <Sparkles size={20} color="#d4af37" />
          </div>
        </div>
      )
    },
    // 2b. Daily Esma (Small)
    {
      id: 'daily-esma',
      size: 'bento-2x1',
      content: (
        <div className="bento-content">
          <div className="bento-tag">{t('home.dailyName')}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700' }}>{dailyContent?.esma?.name}</span>
            <span style={{ fontSize: '18px', fontFamily: 'serif', color: 'var(--primary-color)' }}>{dailyContent?.esma?.arabic}</span>
          </div>
        </div>
      )
    },
    // 2c. Daily Dua (Small)
    {
        id: 'daily-dua',
        size: 'bento-2x1',
        content: (
          <div className="bento-content">
            <div className="bento-tag">{t('home.dailyPrayer')}</div>
            <p style={{ fontSize: '11px', margin: '4px 0', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              "{t(dailyContent?.dua?.text)}"
            </p>
          </div>
        )
    },
    // 3. Featured Features
    { id: 'qibla', icon: <Compass size={22} />, size: 'bento-1x1', label: t('features.qibla') },
    { id: 'zikirmatik', icon: <Fingerprint size={22} />, size: 'bento-1x1', label: t('features.dhikr') },
    { id: 'social', icon: <Heart size={22} />, size: 'bento-2x1', label: t('social.title') },
    { id: 'adhkar', icon: <Sun size={22} />, size: 'bento-1x1', label: t('features.tasbih') },
    { id: 'imsakiye', icon: <Moon size={22} />, size: 'bento-1x1', label: t('features.imsakiye') },
    { id: 'family', icon: <Users size={22} />, size: 'bento-2x1', label: t('features.family') },
    { id: 'radio', icon: <Radio size={22} />, size: 'bento-2x1', label: t('features.radio') }
  ];

  return (
    <div className="bento-grid">
      {items.map((item) => (
        <div 
          key={item.id}
          className={`bento-item ${item.size} ${item.highlight ? 'bento-highlight' : ''}`}
          onClick={item.onClick || (() => onSelectFeature(item.id))}
        >
          {item.content ? item.content : (
            <>
              <div className="bento-icon">{item.icon}</div>
              <div className="bento-title">{item.label}</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default BentoDashboard;
