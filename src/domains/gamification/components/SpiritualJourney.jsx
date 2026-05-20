import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, CalendarDays, Share2, Star, Target, TrendingUp, Trophy } from 'lucide-react';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import { useGamification } from '../../../hooks/useGamification';
import { useFamily } from '../../../context/FamilyContext';
import { getLevelProgress, getNextLevel, TIER_COLORS } from '../../../data/gamificationData';
import {
  buildFamilyWeeklySummary,
  buildWeeklySocialSummary
} from '../../../services/weeklySocialService';
import {
  logFamilySummaryOpened,
  logMiniLeagueViewed,
  logSpiritualWeeklySummaryOpened
} from '../../../services/analyticsService';
import { buildMiniLeagueSnapshot, getMiniLeaguePreferences } from '../../../services/miniLeagueService';
import { navigateFromAction } from '../../../utils/actionNavigation';
import { useAppStore } from '../../../stores/useAppStore';
import BadgeGrid from './BadgeGrid';
import ShareableStatCard from '../../social/components/ShareableStatCard';

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
    <div className="settings-card reveal-stagger flex-col p-24 mb-16" style={{
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

      <div className="flex-between-center mb-20 relative">
        <div className="flex-center-gap-12">
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
            <div className="text-xs font-extrabold uppercase" style={{ color: tierConfig.primary, letterSpacing: '1px' }}>
              {t('gamification.level', 'Seviye')} {currentLevelInfo.level}
            </div>
            <h2 className="m-0 text-2xl font-black text-nav">
              {currentLevelInfo.title}
            </h2>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-black text-primary">
            {points.toLocaleString()}
          </div>
          <div className="text-xs font-bold uppercase text-nav-muted">
            {t('gamification.totalXp', 'Toplam XP')}
          </div>
        </div>
      </div>

      {nextLevelInfo && (
        <div className="relative">
          <div className="flex-between-center mb-8">
            <span className="text-sm font-extrabold text-nav-muted">
              {t('gamification.progress', 'Sonraki Seviye Ilerlemesi')}
            </span>
            <span className="text-sm font-black" style={{ color: tierConfig.primary }}>
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

          <div className="flex-between-center mt-8">
            <span className="text-xs font-bold text-nav-muted">
              {points.toLocaleString()} XP
            </span>
            <span className="text-xs font-extrabold text-nav">
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
      <div className="reveal-stagger flex-center-gap-16 p-16 rounded-16 mb-24 border-glass bg-nav-hover">
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
        <div className="flex-1">
          <h4 className="m-0 mb-4 text-lg font-extrabold text-nav">
            {t('gamification.targetTitle', 'Hedefe Cok Yakinsin')}
          </h4>
          <p className="m-0 text-sm text-nav-muted leading-relaxed">
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
    <div className="settings-card reveal-stagger flex-col p-22 mb-20" style={{
      background: 'linear-gradient(145deg, rgba(15, 118, 110, 0.12), rgba(212, 175, 55, 0.08))',
      border: '1px solid rgba(15, 118, 110, 0.18)'
    }}>
      <div className="flex-between-center items-start gap-12 mb-16">
        <div>
          <div className="text-sm font-black text-primary uppercase mb-6" style={{ letterSpacing: '1px' }}>
            {t('socialRetention.weeklyYou', 'Bu hafta sen')}
          </div>
          <h3 className="m-0 text-nav text-xl font-black">
            {weeklySummary.consistencyBand.label}
          </h3>
          <p className="mt-6 m-0 text-nav-muted text-sm font-semibold leading-relaxed">
            {weeklySummary.consistencyBand.description}
          </p>
        </div>
        <div className="min-w-70 p-12 rounded-16 text-center border-glass" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="text-3xl font-black" style={{ color: weeklySummary.consistencyBand.accent }}>
            {weeklySummary.consistencyScore}
          </div>
          <div className="text-xs font-extrabold uppercase text-nav-muted">
            {t('socialRetention.rhythmScore', 'Ritim skoru')}
          </div>
        </div>
      </div>

      <div className="grid-3 gap-10">
        <div className="nav-card">
          <div className="text-xl font-black text-nav">{weeklySummary.current.activeDays}</div>
          <div className="card-label">{t('socialRetention.activeDays', 'Aktif gun')}</div>
        </div>
        <div className="nav-card">
          <div className="text-xl font-black text-nav">{weeklySummary.ritualCount}</div>
          <div className="card-label">{t('socialRetention.completedSteps', 'Tamamlanan adim')}</div>
        </div>
        <div className="nav-card">
          <div className="text-xl font-black text-nav">
            {weeklySummary.deltas.activeDays >= 0 ? '+' : ''}{weeklySummary.deltas.activeDays}
          </div>
          <div className="card-label">{t('socialRetention.vsLastWeek', 'Gecen haftaya gore')}</div>
        </div>
      </div>
    </div>
  );

  const renderFamilyRhythm = () => {
    if (!familySummary) return null;

    return (
      <div className="settings-card reveal-stagger flex-col p-22 mb-24" style={{
        background: 'linear-gradient(145deg, rgba(249, 115, 22, 0.10), rgba(16, 185, 129, 0.08))',
        border: '1px solid rgba(249, 115, 22, 0.18)'
      }}>
        <div className="text-sm font-black uppercase mb-6" style={{ color: 'var(--nav-accent)', letterSpacing: '1px' }}>
          {t('socialRetention.weeklyGroup', 'Bu hafta grubun')}
        </div>
        <h3 className="m-0 text-nav text-xl font-black">
          {family?.name || 'Ailenin ritmi'}
        </h3>
        <p className="mt-8 mb-18 text-nav-muted text-sm font-semibold leading-relaxed">
          {familySummary.encouragement}
        </p>

        <div className="grid-3 gap-10 mb-16">
          <div className="nav-card">
            <div className="text-xl font-black text-nav">{familySummary.memberCount}</div>
            <div className="card-label">{t('socialRetention.members', 'Uye')}</div>
          </div>
          <div className="nav-card">
            <div className="text-xl font-black text-nav">{familySummary.familyStrength}</div>
            <div className="card-label">{t('socialRetention.streakStrength', 'Seri gucu')}</div>
          </div>
          <div className="nav-card">
            <div className="text-xl font-black text-nav">{familySummary.totalBadgeCount}</div>
            <div className="card-label">{t('socialRetention.badges', 'Toplam rozet')}</div>
          </div>
        </div>

        <div className="p-16 rounded-16 border-glass" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex-between-center gap-12 mb-8">
            <span className="text-base font-extrabold text-nav">
              {familySummary.recommendedGoal.title}
            </span>
            <span className="text-base font-black" style={{ color: 'var(--nav-accent)' }}>
              %{familySummary.recommendedGoal.progressPercent}
            </span>
          </div>
          <div className="h-10 rounded-full overflow-hidden mb-10" style={{ background: 'rgba(0,0,0,0.18)' }}>
            <div style={{
              width: `${familySummary.recommendedGoal.progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--nav-accent), #10b981)'
            }} />
          </div>
          <p className="m-0 text-nav-muted text-sm font-semibold leading-relaxed">
            {familySummary.recommendedGoal.description}
          </p>
        </div>
      </div>
    );
  };

  const renderMiniLeague = () => (
    <div className="settings-card reveal-stagger flex-col p-22 mb-24" style={{
      background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.10), rgba(14, 165, 233, 0.06))',
      border: '1px solid rgba(59, 130, 246, 0.18)'
    }}>
      <div className="flex-between-center items-start gap-12 mb-14">
        <div>
          <div className="text-sm font-black uppercase mb-6 text-blue-400" style={{ letterSpacing: '1px', color: '#60a5fa' }}>
            {t('socialRetention.gentleCompetition', 'Hafif rekabet')}
          </div>
          <h3 className="m-0 text-nav text-xl font-black">
            {miniLeagueSummary.enabled
              ? t(miniLeagueSummary.bandKey, 'Isinma turu')
              : t(miniLeagueSummary.titleKey, 'Ritim halkasi kapali')}
          </h3>
          <p className="mt-8 m-0 text-nav-muted text-sm font-semibold leading-relaxed">
            {miniLeagueSummary.enabled
              ? t(miniLeagueSummary.encouragementKey, 'Ritmini sakin sekilde kurarken kendi gecen haftan en iyi referans olsun.')
              : t(miniLeagueSummary.descriptionKey, 'Istersen anonim mini lige katilip sadece istikrar bandini gorebilirsin.')}
          </p>
        </div>
        <div className="w-48 h-48 rounded-16 flex-center" style={{ background: 'rgba(59, 130, 246, 0.14)', color: '#60a5fa' }}>
          <Trophy size={22} />
        </div>
      </div>

      {miniLeagueSummary.enabled ? (
        <div className="grid-3 gap-10 mb-14">
          <div className="nav-card">
            <div className="text-xl font-black text-nav">%{miniLeagueSummary.percentile}</div>
            <div className="card-label">{t('socialRetention.band', 'Band')}</div>
          </div>
          <div className="nav-card">
            <div className="text-xl font-black text-nav">{miniLeagueSummary.leagueSize}</div>
            <div className="card-label">{t('socialRetention.circleSize', 'Kisilik halka')}</div>
          </div>
          <div className="nav-card">
            <div className="text-lg font-black text-nav">
              {t(`socialRetention.visibility_${miniLeagueSummary.visibilityMode}`, miniLeagueSummary.visibilityMode)}
            </div>
            <div className="card-label">{t('socialRetention.visibility', 'Gorunurluk')}</div>
          </div>
        </div>
      ) : null}

      <div className="p-14 px-16 rounded-16 border-glass flex-between-center gap-12" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="text-base font-bold text-nav">
          {miniLeagueSummary.enabled
            ? t(miniLeagueSummary.standingKey, 'Ritmin oturdukca yukari cikiyorsun')
            : t('socialRetention.defaultStanding', 'Ayarlardan acarsan anonim ritim bandini gorebilirsin.')}
        </div>
        <button
          onClick={() => {
            onClose?.();
            useAppStore.getState().setActiveFeature('settings');
          }}
          className="rounded-full px-14 py-10 font-extrabold border-none cursor-pointer"
          style={{ background: 'rgba(59, 130, 246, 0.16)', color: '#60a5fa' }}
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

      <div className="feature-content p-20">
        {renderLevelProgress()}
        {renderGoalBox()}
        {renderWeeklyRhythm()}
        {renderFamilyRhythm()}
        {miniLeaguePreferences ? renderMiniLeague() : null}

        <div className="reveal-stagger grid-3 gap-12 mb-20">
          <div className="nav-card">
            <div className="text-2xl font-black text-nav">{weeklySummary.current.activeDays}</div>
            <div className="text-sm font-extrabold uppercase text-nav-muted">Aktif gun</div>
          </div>
          <div className="nav-card">
            <div className="text-2xl font-black text-nav">+{weeklySummary.current.xpEarned}</div>
            <div className="text-sm font-extrabold uppercase text-nav-muted">Haftalik XP</div>
          </div>
          <div className="nav-card">
            <div className="text-2xl font-black text-nav">{earnedBadges.length}</div>
            <div className="text-sm font-extrabold uppercase text-nav-muted">Rozet</div>
          </div>
        </div>

        <div className="reveal-stagger mb-24">
          <div className="flex-center-gap-8 mb-14 px-8">
            <div className="w-4 h-16 rounded-full" style={{ width: '4px', height: '16px', background: 'var(--accent-gold)', borderRadius: '999px' }} />
            <h3 className="m-0 text-base font-black text-nav uppercase">
              Bugunku akisin
            </h3>
          </div>

          <div className="flex-col-gap-10">
            {quickActions.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className="hover-lift w-full p-16 rounded-18 border-glass text-left cursor-pointer"
                style={{
                  background: 'linear-gradient(145deg, var(--nav-bg), var(--nav-hover))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div className="w-44 h-44 rounded-14 flex-center" style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="text-base font-black text-nav mb-4">
                    {item.title}
                  </div>
                  <div className="text-sm font-semibold text-nav-muted leading-relaxed">
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
