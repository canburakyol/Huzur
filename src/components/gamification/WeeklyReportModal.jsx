import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Award, BookOpen, ChevronRight, Flame, Sparkles, Target, X } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { buildWeeklyEngagementSnapshot, toLocalDateKey } from '../../services/engagementSummaryService';
import { ANALYTICS_EVENTS, logAiTrustSurfaced, logEvent, logWeeklyInsightV1Viewed } from '../../services/analyticsService';
import { getAiFeatureFlags } from '../../services/aiFeatureFlagService';
import { buildAiContext } from '../../services/aiContextService';
import { generateWeeklyInsightsV1 } from '../../services/aiService';
import { buildPremiumMomentAnalyticsPayload, getPremiumMoment, openPremiumMoment } from '../../services/premiumMomentService';
import ReferralTriggerCard from '../ReferralTriggerCard';
import { useReferralTriggerSurface } from '../../hooks/useReferralTriggerSurface';
import { isPro } from '../../services/proService';
import { logger } from '../../utils/logger';

const REPORT_KEY = 'huzur_last_weekly_report';

const getWeekStart = (value) => {
  const date = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
};

const getLastCompletedWeek = (today = new Date()) => {
  const currentWeekStart = getWeekStart(today);
  const end = new Date(currentWeekStart);
  end.setDate(end.getDate() - 1);

  const start = new Date(end);
  start.setDate(end.getDate() - 6);

  return {
    start,
    end,
    weekKey: `${toLocalDateKey(start)}_${toLocalDateKey(end)}`
  };
};

const formatWeeklyRange = (start, end) => (
  `${start.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}`
);

const REVIEW_STATUS_LABELS = {
  reviewed: 'Kaynakli ozet',
  contextual: 'Baglamsal ozet',
  general_guidance: 'Genel rehberlik',
  unreviewed: 'Sinirli kaynak'
};

const WeeklyReportModal = ({ onOpenInvite }) => {
  const { t } = useTranslation();
  const reportWindow = useMemo(() => getLastCompletedWeek(), []);
  const [isAvailable, setIsAvailable] = useState(() => storageService.getString(REPORT_KEY, '') !== reportWindow.weekKey);
  const [isOpen, setIsOpen] = useState(false);
  const weeklyStats = useMemo(() => buildWeeklyEngagementSnapshot(7, reportWindow.end), [reportWindow.end]);
  const rangeLabel = useMemo(() => formatWeeklyRange(reportWindow.start, reportWindow.end), [reportWindow.end, reportWindow.start]);
  const [aiInsight, setAiInsight] = useState(null);
  const [premiumMoment, setPremiumMoment] = useState(null);
  const { plan: referralTriggerPlan } = useReferralTriggerSurface({
    surface: 'weekly_report',
    enabled: isOpen,
    weeklyStats,
  });

  useEffect(() => {
    if (!isOpen || !weeklyStats.hasActivity) return;

    logEvent('weekly_report_opened', {
      week_key: reportWindow.weekKey,
      active_days: weeklyStats.activeDays,
      xp_earned: weeklyStats.xpEarned,
      tasks_completed: weeklyStats.tasksCompleted,
      quizzes_completed: weeklyStats.quizzesCompleted
    });
  }, [isOpen, reportWindow.weekKey, weeklyStats]);

  useEffect(() => {
    if (!isOpen || !referralTriggerPlan) {
      return;
    }

    logEvent(ANALYTICS_EVENTS.REFERRAL_TRIGGER_SURFACE_VIEWED, {
      surface: 'weekly_report',
      trigger_id: referralTriggerPlan.triggerId,
      ...referralTriggerPlan.analyticsPayload,
    });
  }, [isOpen, referralTriggerPlan]);

  useEffect(() => {
    let isCancelled = false;

    const resolveInsight = async () => {
      try {
        const flags = await getAiFeatureFlags();
        if (!flags.weekly_insights_v1_enabled) {
          return;
        }
        const startedAt = Date.now();

        const context = buildAiContext({
          activeTab: 'home',
          streakData: null,
          dailyContent: null,
          timings: null,
          nextPrayer: null,
          locationName: '',
          isProUser: false,
          socialSummary: null,
        });
        context.weeklySnapshot = weeklyStats;
        const result = await generateWeeklyInsightsV1({
          weekKey: reportWindow.weekKey,
          context,
        });
        if (isCancelled || !result) {
          return;
        }
        setAiInsight(result);
        if (isOpen) {
          logWeeklyInsightV1Viewed(
            reportWindow.weekKey,
            result.riskBand || 'steady',
            result.provider || 'fallback',
            Date.now() - startedAt,
            {
              reviewStatus: result.reviewStatus || 'unreviewed',
              trustScore: result.trustScore,
              sourceCount: result.sourceCount,
            }
          );
          logAiTrustSurfaced('weekly_report', {
            provider: result.provider || 'fallback',
            confidence: result.confidence || 'medium',
            reviewStatus: result.reviewStatus || 'unreviewed',
            trustScore: result.trustScore,
            sourceCount: result.sourceCount,
          });
        }
        if (!isPro()) {
          setPremiumMoment(getPremiumMoment({
            isPro: false,
            source: 'weekly_report',
            momentType: 'weekly_report',
            weeklyInsightState: { hasInsight: true },
          }));
        }
      } catch (error) {
        logger.warn('[WeeklyReportModal] AI insight fallback', error);
      }
    };

    if (isAvailable) {
      void resolveInsight();
    }

    return () => {
      isCancelled = true;
    };
  }, [isAvailable, isOpen, reportWindow.weekKey, weeklyStats]);

  const handleClose = useCallback(() => {
    storageService.setString(REPORT_KEY, reportWindow.weekKey);
    logEvent('weekly_report_closed', {
      week_key: reportWindow.weekKey
    });
    setIsOpen(false);
    setIsAvailable(false);
  }, [reportWindow.weekKey]);

  const handleDismissBanner = useCallback((e) => {
    e.stopPropagation();
    storageService.setString(REPORT_KEY, reportWindow.weekKey);
    setIsAvailable(false);
  }, [reportWindow.weekKey]);

  const handleOpenInvite = useCallback(() => {
    if (!referralTriggerPlan || typeof onOpenInvite !== 'function') {
      return;
    }

    logEvent(ANALYTICS_EVENTS.REFERRAL_TRIGGER_CTA_CLICKED, {
      surface: 'weekly_report',
      trigger_id: referralTriggerPlan.triggerId,
      ...referralTriggerPlan.analyticsPayload,
    });
    onOpenInvite(referralTriggerPlan.entrySource);
  }, [onOpenInvite, referralTriggerPlan]);

  if (!isAvailable || !weeklyStats.hasActivity) return null;

  const statsCards = [
    {
      label: t('weeklyReport.activeDays', 'Aktif Gun'),
      value: weeklyStats.activeDays,
      icon: <Target size={18} color="#10b981" />
    },
    {
      label: t('weeklyReport.prayerDays', 'Namaz Gunu'),
      value: weeklyStats.prayerDays,
      icon: <Sparkles size={18} color="#d4af37" />
    },
    {
      label: t('weeklyReport.quranDays', 'Kuran Gunu'),
      value: weeklyStats.quranDays,
      icon: <BookOpen size={18} color="#3b82f6" />
    },
    {
      label: t('weeklyReport.routines', 'Rutin'),
      value: weeklyStats.routinesCompleted,
      icon: <Flame size={18} color="#f59e0b" />
    }
  ];

  if (!isOpen) {
    return (
      <div 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          right: '16px',
          zIndex: 998,
          background: 'linear-gradient(135deg, #064e3b, #0f766e)',
          borderRadius: '16px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
          cursor: 'pointer',
          animation: 'reportFadeIn 0.5s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '8px',
            borderRadius: '12px'
          }}>
            <Award size={20} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '800' }}>
              {t('weeklyReport.bannerTitle', 'Haftalık Özetin Hazır')}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: '600' }}>
              {t('weeklyReport.bannerDesc', '+{{xp}} XP kazandın, detayları gör', { xp: weeklyStats.xpEarned })}
            </div>
          </div>
        </div>
        <button
          onClick={handleDismissBanner}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10005,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'reportFadeIn 0.35s ease'
    }}>
      <div className="settings-card" style={{
        flexDirection: 'column',
        padding: '0',
        maxWidth: '400px',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(16, 185, 129, 0.28)',
        boxShadow: '0 24px 52px rgba(0,0,0,0.5), 0 0 40px rgba(16, 185, 129, 0.12)',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #064e3b, #0f766e 60%, #d4af37)',
          padding: '38px 22px 30px',
          position: 'relative'
        }}>
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.18)',
              border: 'none',
              color: '#fff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          <div style={{
            width: '74px',
            height: '74px',
            margin: '0 auto 16px',
            background: 'rgba(255,255,255,0.16)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 24px rgba(0,0,0,0.12)'
          }}>
            <Award size={34} color="#fff" />
          </div>

          <h2 style={{
            margin: 0,
            fontSize: '1.35rem',
            color: '#fff',
            fontWeight: '950',
            letterSpacing: '-0.4px'
          }}>
            {t('weeklyReport.title', 'Haftalik Huzur Ozeti')}
          </h2>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.92)',
            fontWeight: '700'
          }}>
            {rangeLabel}
          </p>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '18px'
          }}>
            {statsCards.map((item) => (
              <div
                key={item.label}
                style={{
                  background: 'var(--nav-hover)',
                  padding: '16px 12px',
                  borderRadius: '16px',
                  border: '1px solid var(--nav-border)'
                }}
              >
                <div style={{ marginBottom: '8px' }}>{item.icon}</div>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: '950',
                  color: 'var(--nav-text)'
                }}>
                  {item.value}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: 'var(--nav-text-muted)',
                  fontWeight: '800',
                  textTransform: 'uppercase'
                }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.18)',
            borderRadius: '18px',
            padding: '16px',
            marginBottom: '18px'
          }}>
            <div style={{
              fontSize: '0.78rem',
              fontWeight: '800',
              color: '#10b981',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              {t('weeklyReport.xp', 'Haftalik XP')}
            </div>
            <div style={{
              fontSize: '1.6rem',
              fontWeight: '950',
              color: 'var(--nav-text)'
            }}>
              +{weeklyStats.xpEarned}
            </div>
            <div style={{
              marginTop: '10px',
              fontSize: '0.82rem',
              lineHeight: '1.6',
              color: 'var(--nav-text-muted)',
              fontWeight: '600'
            }}>
              {t(
                'weeklyReport.summary',
                aiInsight?.summary || `Bu hafta ${weeklyStats.tasksCompleted} gorev, ${weeklyStats.discoveryViews} kesif ve ${weeklyStats.quizzesCompleted} quiz tamamladin.`
              )}
            </div>
          </div>

          {aiInsight ? (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '16px',
              justifyContent: 'center'
            }}>
              <div style={{
                padding: '6px 10px',
                borderRadius: '999px',
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                color: 'var(--nav-text)',
                fontSize: '0.7rem',
                fontWeight: '800'
              }}>
                {aiInsight.confidence === 'high' ? 'Guven yuksek' : aiInsight.confidence === 'low' ? 'Genel rehberlik' : 'Guven dengeli'}
              </div>
              <div style={{
                padding: '6px 10px',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.10)',
                border: '1px solid rgba(16, 185, 129, 0.18)',
                color: 'var(--nav-text)',
                fontSize: '0.7rem',
                fontWeight: '800'
              }}>
                {REVIEW_STATUS_LABELS[aiInsight.reviewStatus] || 'Sinirli kaynak'}
              </div>
              {Number.isFinite(Number(aiInsight.trustScore)) ? (
                <div style={{
                  padding: '6px 10px',
                  borderRadius: '999px',
                  background: 'rgba(59, 130, 246, 0.10)',
                  border: '1px solid rgba(59, 130, 246, 0.18)',
                  color: 'var(--nav-text)',
                  fontSize: '0.7rem',
                  fontWeight: '800'
                }}>
                  Trust {Math.round(Number(aiInsight.trustScore) * 100)}%
                </div>
              ) : null}
              {Array.isArray(aiInsight.sources) ? aiInsight.sources.slice(0, 2).map((source, index) => (
                <div
                  key={`${source.label || 'source'}_${index}`}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '999px',
                    background: 'var(--nav-hover)',
                    border: '1px solid var(--nav-border)',
                    color: 'var(--nav-text-muted)',
                    fontSize: '0.7rem',
                    fontWeight: '700'
                  }}
                >
                  {source.label}
                </div>
              )) : null}
            </div>
          ) : null}

          <p style={{
            fontSize: '0.85rem',
            color: 'var(--nav-text-muted)',
            lineHeight: '1.65',
            fontWeight: '600',
            marginBottom: '20px'
          }}>
            {aiInsight?.socialHint || t(
              'weeklyReport.motivation',
              'Kucuk ama istikrarli adimlar en guclu degisimi olusturur. Bu haftaki ritmini sakin bir sekilde korumaya devam et.'
            )}
          </p>

          {referralTriggerPlan ? (
            <ReferralTriggerCard plan={referralTriggerPlan} onOpenInvite={handleOpenInvite} />
          ) : null}

          {premiumMoment?.showUpgrade ? (
            <div style={{
              background: 'rgba(212, 175, 55, 0.10)',
              border: '1px solid rgba(212, 175, 55, 0.18)',
              borderRadius: '18px',
              padding: '16px',
              marginBottom: '18px',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#d4af37', fontWeight: '900', textTransform: 'uppercase', marginBottom: '6px' }}>
                Daha derin haftalik destek
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: '900', color: 'var(--nav-text)', marginBottom: '6px' }}>
                {premiumMoment.headline}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--nav-text-muted)', lineHeight: '1.55', fontWeight: '600', marginBottom: '12px' }}>
                {premiumMoment.description}
              </div>
              <button
                type="button"
                onClick={() => {
                  logEvent(ANALYTICS_EVENTS.PREMIUM_MOMENT_OPENED, buildPremiumMomentAnalyticsPayload(premiumMoment));
                  openPremiumMoment(premiumMoment);
                }}
                style={{
                  border: 'none',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, var(--nav-accent), var(--accent-gold))',
                  color: '#fff',
                  padding: '12px 14px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Pro destegi gor
              </button>
            </div>
          ) : null}

          <button
            onClick={handleClose}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, var(--nav-accent), var(--accent-gold))',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              fontSize: '0.95rem',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 10px 24px rgba(79, 70, 229, 0.18)'
            }}
          >
            {t('weeklyReport.continue', 'Yeni Haftaya Basla')}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes reportFadeIn {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default WeeklyReportModal;
