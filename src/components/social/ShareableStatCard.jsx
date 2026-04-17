import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import { Activity, CalendarDays, Share2, Sparkles, Star, Trophy } from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';
import IslamicBackButton from '../shared/IslamicBackButton';
import { buildWeeklyEngagementSnapshot } from '../../services/engagementSummaryService';
import { logShareSent } from '../../services/analyticsService';
import { openShareCard } from '../../services/shareCardService';
import { useToast } from '../../hooks/useToast';

const ShareableStatCard = ({ onClose }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { level, points, title, badgeDetails = [], awardBadge } = useGamification();
  const cardRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const levelInfo = useMemo(() => (
    typeof level === 'object'
      ? level
      : { level: Number(level) || 1, title: title || 'Yeni Baslayan', tier: 'beginner' }
  ), [level, title]);

  const weeklyStats = useMemo(() => buildWeeklyEngagementSnapshot(), []);
  const featuredBadges = badgeDetails.slice(0, 3);

  useEffect(() => {
    openShareCard('journey_progress', 'spiritual_journey');
  }, []);

  const downloadBlob = (blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.download = 'huzur-journey-card.png';
    link.href = url;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleShare = async () => {
    if (!cardRef.current || isCapturing) return;

    try {
      setIsCapturing(true);

      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#042f2e'
      });

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
      if (!blob) {
        throw new Error('capture_failed');
      }

      let channel = 'download';
      const file = new File([blob], 'huzur-journey-card.png', { type: 'image/png' });
      const canShareFiles = typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

      if (navigator.share && canShareFiles) {
        await navigator.share({
          title: 'Huzur Istatistik Kartim',
          text: 'Huzur ile manevi ritmimi takip ediyorum.',
          files: [file]
        });
        channel = 'native_share';
      } else {
        downloadBlob(blob);
      }

      awardBadge('first_share');
      logShareSent('journey_progress', channel);
    } catch (error) {
      if (error?.name === 'AbortError') {
        return;
      }

      console.error('Error sharing image:', error);
      showToast(t('stats.errors.cardFailed', 'Kart hazirlanirken bir hata olustu.'), 'error');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="feature-overlay">
      <div className="feature-header blur-header">
        <IslamicBackButton onClick={onClose} label={t('shareCard.title', 'Istatistik Karti')} />
      </div>

      <div className="feature-content" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p style={{ textAlign: 'center', color: 'var(--nav-text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
          {t('shareCard.subtitle', 'Bu karti hikayede veya durumunda paylasip istikrarini gorunur hale getirebilirsin.')}
        </p>

        <div
          ref={cardRef}
          style={{
            width: '100%',
            maxWidth: '360px',
            aspectRatio: '9 / 16',
            background: 'linear-gradient(180deg, #064e3b 0%, #022c22 60%, #042f2e 100%)',
            borderRadius: '28px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            padding: '30px 28px',
            color: '#fff'
          }}
        >
          <div style={{ position: 'absolute', top: '-12%', right: '-8%', width: '190px', height: '190px', background: 'rgba(212, 175, 55, 0.14)', borderRadius: '50%', filter: 'blur(36px)' }} />
          <div style={{ position: 'absolute', bottom: '-8%', left: '-8%', width: '160px', height: '160px', background: 'rgba(16, 185, 129, 0.16)', borderRadius: '50%', filter: 'blur(36px)' }} />
          <div style={{ position: 'absolute', inset: '16px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '22px' }} />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: '950', color: '#f6d365', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>HUZUR</h1>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.72)', margin: '0 0 26px', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('shareCard.subtitle', 'Manevi ritmim')}</p>

            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(246, 211, 101, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.22)'
            }}>
              <Trophy size={40} color="#f6d365" />
              <div style={{ fontSize: '0.78rem', fontWeight: '800', marginTop: '8px', color: 'rgba(255,255,255,0.86)', textTransform: 'uppercase' }}>{t('shareCard.level', 'Seviye')}</div>
              <div style={{ fontSize: '2rem', fontWeight: '950', lineHeight: '1', color: '#f6d365' }}>{levelInfo.level}</div>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 10px', textAlign: 'center' }}>
              {levelInfo.title}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.26)', padding: '8px 16px', borderRadius: '999px', marginBottom: '22px' }}>
              <Star size={16} color="#f6d365" />
              <span style={{ fontWeight: '800' }}>{t('shareCard.xpCollected', { count: points.toLocaleString(), defaultValue: '{{count}} XP toplandi' })}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%', marginBottom: '18px' }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '14px 8px', textAlign: 'center' }}>
                <CalendarDays size={18} color="#86efac" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '1.05rem', fontWeight: '900' }}>{weeklyStats.activeDays}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' }}>{t('shareCard.activeDays', 'Aktif gun')}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '14px 8px', textAlign: 'center' }}>
                <Sparkles size={18} color="#f6d365" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '1.05rem', fontWeight: '900' }}>+{weeklyStats.xpEarned}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' }}>{t('shareCard.weeklyXP', 'Haftalik XP')}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '14px 8px', textAlign: 'center' }}>
                <Trophy size={18} color="#fde68a" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '1.05rem', fontWeight: '900' }}>{badgeDetails.length}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' }}>{t('shareCard.badges', 'Rozet')}</div>
              </div>
            </div>

            <div style={{ width: '100%', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '18px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'rgba(255,255,255,0.6)', marginBottom: '12px', textAlign: 'center', textTransform: 'uppercase' }}>
                {t('shareCard.featuredBadges', 'One cikan rozetler')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                {featuredBadges.map((badge) => (
                  <div key={badge.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '74px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{badge.icon}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center', color: 'rgba(255,255,255,0.8)', lineHeight: '1.35' }}>
                      {badge.name}
                    </div>
                  </div>
                ))}
                {featuredBadges.length === 0 && (
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                    {t('shareCard.noBadges', 'Henuz rozet kazanilmadi.')}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', zIndex: 1, marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
              {t('shareCard.tagline', 'Huzur ile ibadet ritmini sakin ve istikrarli sekilde koru')}
            </p>
          </div>
        </div>

        <button
          onClick={handleShare}
          disabled={isCapturing}
          className="hover-lift"
          style={{
            marginTop: '30px',
            width: '100%',
            maxWidth: '360px',
            padding: '16px',
            background: 'linear-gradient(135deg, #0f766e, #d4af37)',
            color: '#fff',
            border: 'none',
            borderRadius: '18px',
            fontSize: '1.1rem',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: isCapturing ? 'wait' : 'pointer',
            opacity: isCapturing ? 0.7 : 1,
            boxShadow: '0 12px 28px rgba(6, 95, 70, 0.28)'
          }}
        >
          {isCapturing ? <Activity size={20} className="spin" /> : <Share2 size={20} />}
          {isCapturing ? t('shareCard.preparing', 'Kart hazirlaniyor...') : t('shareCard.shareButton', 'Karti Paylas')}
        </button>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ShareableStatCard;
