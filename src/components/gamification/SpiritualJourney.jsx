import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, CalendarDays, Share2, Star, Target, TrendingUp, Trophy } from 'lucide-react';
import IslamicBackButton from '../shared/IslamicBackButton';
import { useGamification } from '../../hooks/useGamification';
import { useFamily } from '../../context/FamilyContext';
import { getLevelProgress, getNextLevel, TIER_COLORS } from '../../data/gamificationData';
import {
  buildFamilyWeeklySummary,
  buildWeeklySocialSummary
} from '../../services/weeklySocialService';
import {
  logFamilySummaryOpened,
  logMiniLeagueViewed,
  logSpiritualWeeklySummaryOpened
} from '../../services/analyticsService';
import { buildMiniLeagueSnapshot, getMiniLeaguePreferences } from '../../services/miniLeagueService';
import { navigateFromAction } from '../../utils/actionNavigation';
import BadgeGrid from './BadgeGrid';
import ShareableStatCard from '../social/ShareableStatCard';

const SpiritualJourney = ({ onClose }) => {
  const { t } = useTranslation();
  const { points, level, earnedBadges } = useGamification();
  const { family } = useFamily();
  const [showShareCard, setShowShareCard] = useState(false);
  const [miniLeaguePreferences, setMiniLeaguePreferences] = useState(null);

  const currentLevelInfo = useMemo(() => {
    if (typeof level === 'object') return level;
    return { level: level || 1, title: 'Yeni Baslayan', tier: 'beginner' };
  }, [level]);

  const nextLevelInfo = useMemo(() => getNextLevel(currentLevelInfo.level), [currentLevelInfo]);
  const progressPercent = useMemo(() => getLevelProgress(points), [points]);
  const weeklySummary = useMemo(() => buildWeeklySocialSummary(), []);
  const familySummary = useMemo(() => (
    family ? buildFamilyWeeklySummary(family, weeklySummary) : null
  ), [family, weeklySummary]);
  const miniLeagueSummary = useMemo(() => (
    buildMiniLeagueSnapshot(weeklySummary, miniLeaguePreferences || undefined)
  ), [miniLeaguePreferences, weeklySummary]);
  const tierConfig = TIER_COLORS[currentLevelInfo.tier] || TIER_COLORS.beginner;

  useEffect(() => {
    logSpiritualWeeklySummaryOpened(weeklySummary.weekKey, weeklySummary.consistencyBand.key);
  }, [weeklySummary]);

  useEffect(() => {
    if (!familySummary || !family?.id) return;
    logFamilySummaryOpened(family.id, familySummary.weekKey, familySummary.memberCount);
  }, [family, familySummary]);

  useEffect(() => {
    let isMounted = true;

    const loadMiniLeaguePreferences = async () => {
      const preferences = await getMiniLeaguePreferences();
      if (isMounted) {
        setMiniLeaguePreferences(preferences);
      }
    };

    loadMiniLeaguePreferences();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!miniLeagueSummary) return;
    logMiniLeagueViewed(
      miniLeagueSummary.weekKey || weeklySummary.weekKey,
      miniLeagueSummary.enabled ? miniLeagueSummary.bandLabel : 'closed',
      miniLeagueSummary.visibilityMode
    );
  }, [miniLeagueSummary, weeklySummary.weekKey]);

  const quickActions = [
    {
      id: 'daily-quiz',
      icon: <Brain size={18} color="#d4af37" />,
      title: t('quiz.title', 'Gunun Testi'),
      description: 'Kisa bir bilgi turu ile serini besle.',
      onClick: () => navigateFromAction('/daily-quiz')
    },
    {
      id: 'routine-builder',
      icon: <CalendarDays size={18} color="#10b981" />,
      title: t('routine.title', 'Gunluk Rutinlerim'),
      description: 'Sabah ve aksam ritmini bugunden sekillendir.',
      onClick: () => navigateFromAction('/routine-builder')
    },
    {
      id: 'share-card',
      icon: <Share2 size={18} color="#3b82f6" />,
      title: t('gamification.share', 'Istatistik Kartini Paylas'),
      description: 'Ilerlemeni gorunur kilip motive edici bir kart olustur.',
      onClick: () => setShowShareCard(true)
    }
  ];

  if (showShareCard) {
    return <ShareableStatCard onClose={() => setShowShareCard(false)} />;
  }

  const renderLevelProgress = () => (
    <div className="settings-card reveal-stagger" style={{
      flexDirection: 'column',
      padding: '24px',
      marginBottom: '16px',
      background: 'linear-gradient(145deg, var(--nav-bg), var(--nav-hover))',
      border: `1px solid ${tierConfig.primary}40`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        background: tierConfig.primary,
        filter: 'blur(80px)',
        opacity: 0.15,
        borderRadius: '50%'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '20px',
            background: tierConfig.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: `0 8px 24px ${tierConfig.primary}40`
          }}>
            <Star size={28} fill="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: tierConfig.primary, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {t('gamification.level', 'Seviye')} {currentLevelInfo.level}
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '950', color: 'var(--nav-text)' }}>
              {currentLevelInfo.title}
            </h2>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-gold)' }}>
            {points.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>
            {t('gamification.totalXp', 'Toplam XP')}
          </div>
        </div>
      </div>

      {nextLevelInfo && (
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--nav-text-muted)' }}>
              {t('gamification.progress', 'Sonraki Seviye Ilerlemesi')}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: '900', color: tierConfig.primary }}>
              {progressPercent}%
            </span>
          </div>

          <div style={{
            height: '14px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid var(--nav-border)'
          }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: tierConfig.gradient,
              borderRadius: '10px',
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                transform: 'skewX(-20deg) translateX(-150%)',
                animation: 'shimmer 2.5s infinite'
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--nav-text-muted)' }}>
              {points.toLocaleString()} XP
            </span>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--nav-text)' }}>
              {t('gamification.nextLevel', 'Seviye')} {nextLevelInfo.level}: {nextLevelInfo.title} ({nextLevelInfo.minPoints.toLocaleString()} XP)
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderGoalBox = () => {
    if (!nextLevelInfo) return null;
    const remaining = nextLevelInfo.minPoints - points;

    return (
      <div className="reveal-stagger" style={{
        background: 'var(--nav-hover)',
        padding: '16px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        border: '1px solid var(--nav-border)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: 'rgba(59, 130, 246, 0.15)',
          color: '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Target size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: '800', color: 'var(--nav-text)' }}>
            {t('gamification.targetTitle', 'Hedefe Cok Yakinsin')}
          </h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--nav-text-muted)', lineHeight: '1.4' }}>
            {t('gamification.targetDesc', {
              remaining: remaining.toLocaleString(),
              nextTitle: nextLevelInfo.title,
              defaultValue: '{{nextTitle}} unvanina ulasmak icin sadece {{remaining}} XP kaldi.'
            })}
          </p>
        </div>
      </div>
    );
  };

  const renderWeeklyRhythm = () => (
    <div className="settings-card reveal-stagger" style={{
      flexDirection: 'column',
      alignItems: 'stretch',
      padding: '22px',
      marginBottom: '20px',
      background: 'linear-gradient(145deg, rgba(15, 118, 110, 0.12), rgba(212, 175, 55, 0.08))',
      border: '1px solid rgba(15, 118, 110, 0.18)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
            {t('socialRetention.weeklyYou', 'Bu hafta sen')}
          </div>
          <h3 style={{ margin: 0, color: 'var(--nav-text)', fontSize: '1.1rem', fontWeight: '900' }}>
            {weeklySummary.consistencyBand.label}
          </h3>
          <p style={{ margin: '6px 0 0', color: 'var(--nav-text-muted)', fontSize: '0.8rem', fontWeight: '600', lineHeight: '1.5' }}>
            {weeklySummary.consistencyBand.description}
          </p>
        </div>
        <div style={{
          minWidth: '68px',
          padding: '10px 12px',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.06)',
          textAlign: 'center',
          border: '1px solid var(--nav-border)'
        }}>
          <div style={{ fontSize: '1.3rem', fontWeight: '950', color: weeklySummary.consistencyBand.accent }}>
            {weeklySummary.consistencyScore}
          </div>
          <div style={{ fontSize: '0.62rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>
            {t('socialRetention.rhythmScore', 'Ritim skoru')}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <div style={{ background: 'var(--nav-hover)', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--nav-border)' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: '950', color: 'var(--nav-text)' }}>{weeklySummary.current.activeDays}</div>
          <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>{t('socialRetention.activeDays', 'Aktif gun')}</div>
        </div>
        <div style={{ background: 'var(--nav-hover)', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--nav-border)' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: '950', color: 'var(--nav-text)' }}>{weeklySummary.ritualCount}</div>
          <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>{t('socialRetention.completedSteps', 'Tamamlanan adim')}</div>
        </div>
        <div style={{ background: 'var(--nav-hover)', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--nav-border)' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: '950', color: 'var(--nav-text)' }}>
            {weeklySummary.deltas.activeDays >= 0 ? '+' : ''}{weeklySummary.deltas.activeDays}
          </div>
          <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>{t('socialRetention.vsLastWeek', 'Gecen haftaya gore')}</div>
        </div>
      </div>
    </div>
  );

  const renderFamilyRhythm = () => {
    if (!familySummary) return null;

    return (
      <div className="settings-card reveal-stagger" style={{
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '22px',
        marginBottom: '24px',
        background: 'linear-gradient(145deg, rgba(249, 115, 22, 0.10), rgba(16, 185, 129, 0.08))',
        border: '1px solid rgba(249, 115, 22, 0.18)'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--nav-accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
          {t('socialRetention.weeklyGroup', 'Bu hafta grubun')}
        </div>
        <h3 style={{ margin: 0, color: 'var(--nav-text)', fontSize: '1.05rem', fontWeight: '900' }}>
          {family?.name || 'Ailenin ritmi'}
        </h3>
        <p style={{ margin: '8px 0 18px', color: 'var(--nav-text-muted)', fontSize: '0.8rem', fontWeight: '600', lineHeight: '1.5' }}>
          {familySummary.encouragement}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'var(--nav-hover)', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--nav-border)' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: '950', color: 'var(--nav-text)' }}>{familySummary.memberCount}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>{t('socialRetention.members', 'Uye')}</div>
          </div>
          <div style={{ background: 'var(--nav-hover)', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--nav-border)' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: '950', color: 'var(--nav-text)' }}>{familySummary.familyStrength}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>{t('socialRetention.streakStrength', 'Seri gucu')}</div>
          </div>
          <div style={{ background: 'var(--nav-hover)', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--nav-border)' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: '950', color: 'var(--nav-text)' }}>{familySummary.totalBadgeCount}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>{t('socialRetention.badges', 'Toplam rozet')}</div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--nav-border)', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--nav-text)' }}>
              {familySummary.recommendedGoal.title}
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: '900', color: 'var(--nav-accent)' }}>
              %{familySummary.recommendedGoal.progressPercent}
            </span>
          </div>
          <div style={{ height: '10px', background: 'rgba(0,0,0,0.18)', borderRadius: '999px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{
              width: `${familySummary.recommendedGoal.progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--nav-accent), #10b981)'
            }} />
          </div>
          <p style={{ margin: 0, color: 'var(--nav-text-muted)', fontSize: '0.76rem', fontWeight: '600', lineHeight: '1.45' }}>
            {familySummary.recommendedGoal.description}
          </p>
        </div>
      </div>
    );
  };

  const renderMiniLeague = () => (
    <div className="settings-card reveal-stagger" style={{
      flexDirection: 'column',
      alignItems: 'stretch',
      padding: '22px',
      marginBottom: '24px',
      background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.10), rgba(14, 165, 233, 0.06))',
      border: '1px solid rgba(59, 130, 246, 0.18)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '900', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
            {t('socialRetention.gentleCompetition', 'Hafif rekabet')}
          </div>
          <h3 style={{ margin: 0, color: 'var(--nav-text)', fontSize: '1.05rem', fontWeight: '900' }}>
            {miniLeagueSummary.enabled
              ? t(miniLeagueSummary.bandKey, 'Isinma turu')
              : t(miniLeagueSummary.titleKey, 'Ritim halkasi kapali')}
          </h3>
          <p style={{ margin: '8px 0 0', color: 'var(--nav-text-muted)', fontSize: '0.8rem', fontWeight: '600', lineHeight: '1.5' }}>
            {miniLeagueSummary.enabled
              ? t(miniLeagueSummary.encouragementKey, 'Ritmini sakin sekilde kurarken kendi gecen haftan en iyi referans olsun.')
              : t(miniLeagueSummary.descriptionKey, 'Istersen anonim mini lige katilip sadece istikrar bandini gorebilirsin.')}
          </p>
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '16px',
          background: 'rgba(59, 130, 246, 0.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#60a5fa'
        }}>
          <Trophy size={22} />
        </div>
      </div>

      {miniLeagueSummary.enabled ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
          <div style={{ background: 'var(--nav-hover)', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--nav-border)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '950', color: 'var(--nav-text)' }}>%{miniLeagueSummary.percentile}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>{t('socialRetention.band', 'Band')}</div>
          </div>
          <div style={{ background: 'var(--nav-hover)', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--nav-border)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '950', color: 'var(--nav-text)' }}>{miniLeagueSummary.leagueSize}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>{t('socialRetention.circleSize', 'Kisilik halka')}</div>
          </div>
          <div style={{ background: 'var(--nav-hover)', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--nav-border)' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '950', color: 'var(--nav-text)' }}>
              {t(`socialRetention.visibility_${miniLeagueSummary.visibilityMode}`, miniLeagueSummary.visibilityMode)}
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>{t('socialRetention.visibility', 'Gorunurluk')}</div>
          </div>
        </div>
      ) : null}

      <div style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '16px',
        padding: '14px 16px',
        border: '1px solid var(--nav-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--nav-text)' }}>
          {miniLeagueSummary.enabled
            ? t(miniLeagueSummary.standingKey, 'Ritmin oturdukca yukari cikiyorsun')
            : t('socialRetention.defaultStanding', 'Ayarlardan acarsan anonim ritim bandini gorebilirsin.')}
        </div>
        <button
          onClick={() => {
            onClose?.();
            window.dispatchEvent(new CustomEvent('openFeature', { detail: 'settings' }));
          }}
          style={{
            border: 'none',
            borderRadius: '999px',
            padding: '10px 14px',
            background: 'rgba(59, 130, 246, 0.16)',
            color: '#60a5fa',
            fontWeight: '800',
            cursor: 'pointer'
          }}
        >
          {t(miniLeagueSummary.ctaKey, 'Gorunurlugu duzenle')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="feature-overlay">
      <div className="feature-header blur-header">
        <IslamicBackButton onClick={onClose} label={t('journey.title', 'Manevi Yolculugum')} />
      </div>

      <div className="feature-content" style={{ padding: '20px' }}>
        {renderLevelProgress()}
        {renderGoalBox()}
        {renderWeeklyRhythm()}
        {renderFamilyRhythm()}
        {miniLeaguePreferences ? renderMiniLeague() : null}

        <div className="reveal-stagger" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ background: 'var(--nav-hover)', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--nav-border)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '950', color: 'var(--nav-text)' }}>{weeklySummary.current.activeDays}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>Aktif gun</div>
          </div>
          <div style={{ background: 'var(--nav-hover)', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--nav-border)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '950', color: 'var(--nav-text)' }}>+{weeklySummary.current.xpEarned}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>Haftalik XP</div>
          </div>
          <div style={{ background: 'var(--nav-hover)', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--nav-border)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '950', color: 'var(--nav-text)' }}>{earnedBadges.length}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>Rozet</div>
          </div>
        </div>

        <div className="reveal-stagger" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', padding: '0 8px' }}>
            <div style={{ width: '4px', height: '16px', background: 'var(--accent-gold)', borderRadius: '999px' }} />
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '900', color: 'var(--nav-text)', textTransform: 'uppercase' }}>
              Bugunku akisin
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quickActions.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className="hover-lift"
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(145deg, var(--nav-bg), var(--nav-hover))',
                  border: '1px solid var(--nav-border)',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: '900', color: 'var(--nav-text)', marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>
                    {item.description}
                  </div>
                </div>
                <TrendingUp size={18} color="var(--nav-text-muted)" />
              </button>
            ))}
          </div>
        </div>

        <BadgeGrid earnedBadges={earnedBadges} userStats={{}} />
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: skewX(-20deg) translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default SpiritualJourney;
