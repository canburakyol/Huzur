import React, { useEffect, useMemo, useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { useTranslation } from 'react-i18next';
import MemberCard from './MemberCard';
import IslamicBackButton from '../shared/IslamicBackButton';
import BadgeGrid from '../gamification/BadgeGrid';
import StreakDetail from '../gamification/StreakDetail';
import {
  Users,
  UserPlus,
  Shield,
  Activity,
  Clock,
  Share2,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { buildFamilyWeeklySummary, buildWeeklySocialSummary } from '../../services/weeklySocialService';
import {
  logFamilyGoalCompleted,
  logFamilyGoalContributed,
  logFamilyGoalViewed,
  logFamilySummaryOpened
} from '../../services/analyticsService';
import { getCurrentUserId } from '../../services/authService';
import { toLocalDateKey } from '../../services/engagementSummaryService';

const DiscoveryList = ({ title, subtitle, items, t }) => {
  if (!items?.length) return null;

  return (
    <div className="settings-card p-24 flex flex-col items-stretch gap-16">
      <div>
        <div style={{ fontWeight: '900', color: 'var(--nav-text)', fontSize: '1.05rem' }}>{title}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--nav-text-muted)', fontWeight: '600', marginTop: '4px' }}>{subtitle}</div>
      </div>
      <div className="sanctuary-stack-list">
        {items.map((publicFamily) => (
          <div key={publicFamily.id} className="settings-card sanctuary-family-discovery-card" style={{ padding: '18px 20px', background: 'var(--nav-hover)' }}>
            <div className="flex items-center gap-12">
              <div
                className="settings-icon-box"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: publicFamily.isSeed ? 'rgba(249, 115, 22, 0.14)' : 'rgba(59, 130, 246, 0.12)',
                  color: publicFamily.isSeed ? 'var(--nav-accent)' : '#3b82f6'
                }}
              >
                {publicFamily.isSeed ? <Sparkles size={20} /> : <Users size={20} />}
              </div>
              <div className="flex-1">
                <div style={{ fontWeight: '900', color: 'var(--nav-text)' }}>{publicFamily.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                  {publicFamily.isSeed ? t('family.discoverySeedLabel', 'Huzur toplulugundan onerilen aile') : t('family.discoveryRealLabel', 'Topluluktan gorunen aile')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FamilyDashboard = ({ onClose }) => {
  const {
    family,
    publicFamilies,
    weeklyGoal,
    weeklyGoalLoading,
    loading,
    error,
    createFamily,
    joinFamily,
    contributeWeeklyGoal
  } = useFamily();
  const { t } = useTranslation();

  const [mode, setMode] = useState('view');
  const [selectedMember, setSelectedMember] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [busy, setBusy] = useState(false);
  const currentUserId = getCurrentUserId();
  const todayKey = toLocalDateKey();

  const userWeeklySummary = useMemo(() => buildWeeklySocialSummary(), []);
  const familyWeeklySummary = useMemo(() => (
    family ? buildFamilyWeeklySummary(family, userWeeklySummary) : null
  ), [family, userWeeklySummary]);

  const visibleDiscoveries = useMemo(() => {
    return (publicFamilies || []).filter((item) => item.id !== family?.id);
  }, [publicFamilies, family?.id]);

  const sharedGoal = weeklyGoal || familyWeeklySummary?.recommendedGoal || null;
  const sharedGoalType = sharedGoal?.goalType || sharedGoal?.type || 'active_days';
  const sharedGoalProgress = Number(sharedGoal?.progressPercent)
    || (sharedGoal?.targetValue > 0
      ? Math.round(((Number(sharedGoal?.currentValue) || 0) / Number(sharedGoal?.targetValue)) * 100)
      : 0);
  const contributorState = currentUserId ? sharedGoal?.contributors?.[currentUserId] : null;
  const alreadyContributedToday = Boolean(
    contributorState?.contributionDates?.manual_checkin === todayKey
      || contributorState?.lastContributionType === 'manual_checkin'
      && contributorState?.lastContributionDateKey === todayKey
  );

  useEffect(() => {
    if (!family?.id || !familyWeeklySummary) return;
    logFamilySummaryOpened(family.id, familyWeeklySummary.weekKey, familyWeeklySummary.memberCount);
    logFamilyGoalViewed(family.id, familyWeeklySummary.weekKey, sharedGoalType, sharedGoalProgress);
  }, [family, familyWeeklySummary, sharedGoalType, sharedGoalProgress]);

  const handleContribution = async () => {
    if (!family?.id || weeklyGoalLoading || alreadyContributedToday) return;

    const nextGoal = await contributeWeeklyGoal(1, 'manual_checkin');
    if (!nextGoal) return;

    const nextProgress = nextGoal?.targetValue > 0
      ? Math.round(((Number(nextGoal?.currentValue) || 0) / Number(nextGoal?.targetValue)) * 100)
      : 0;

    logFamilyGoalContributed(
      family.id,
      nextGoal.weekKey || familyWeeklySummary?.weekKey,
      nextGoal.goalType || 'active_days',
      1,
      nextProgress
    );

    if (nextGoal.status === 'completed') {
      logFamilyGoalCompleted(
        family.id,
        nextGoal.weekKey || familyWeeklySummary?.weekKey,
        nextGoal.goalType || 'active_days'
      );
    }
  };

  if (!family && !loading) {
    return (
      <div className="settings-container reveal-stagger pb-120">
        <div className="flex items-center gap-16 mb-32">
          <IslamicBackButton onClick={onClose} size="medium" />
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--nav-text)', fontWeight: '950', letterSpacing: '-0.5px' }}>
            {t('family.title')}
          </h2>
        </div>

        <div className="settings-card reveal-stagger flex flex-col items-stretch border-none mb-24" style={{ padding: '32px 24px', background: 'linear-gradient(135deg, var(--nav-accent) 0%, #f59e0b 100%)', color: 'white', boxShadow: '0 15px 35px rgba(249, 115, 22, 0.25)', borderRadius: '28px' }}>
          <div className="settings-icon-box" style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.2)', borderRadius: '18px', marginBottom: '20px', color: 'white' }}>
            <Users size={32} />
          </div>
          <h3 style={{ margin: '0 0 8px 0', color: 'white', fontWeight: '950', fontSize: '1.5rem' }}>{t('family.title')}</h3>
          <p className="leading-relaxed mb-0" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', fontWeight: '600' }}>{t('family.intro')}</p>
        </div>

        {error && (
          <div className="settings-card pulse mb-24 p-16 rounded-16 font-extrabold" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem', justifyContent: 'center' }}>
            {error}
          </div>
        )}

        {mode === 'view' && (
          <div className="flex flex-col gap-12 reveal-stagger">
            <button className="settings-card" onClick={() => setMode('create')} style={{ padding: '24px', background: 'var(--nav-hover)', border: '1px solid var(--nav-border)' }}>
              <div className="settings-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '14px' }}>
                <UserPlus size={24} />
              </div>
              <div className="flex-1 text-left">
                <div style={{ fontWeight: '900', color: 'var(--nav-text)', fontSize: '1.1rem' }}>{t('family.createAction')}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>Yeni bir aile grubu olusturun</div>
              </div>
            </button>
            <button className="settings-card" onClick={() => setMode('join')} style={{ padding: '24px', background: 'var(--nav-hover)', border: '1px solid var(--nav-border)' }}>
              <div className="settings-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '14px' }}>
                <Activity size={24} />
              </div>
              <div className="flex-1 text-left">
                <div style={{ fontWeight: '900', color: 'var(--nav-text)', fontSize: '1.1rem' }}>{t('family.joinAction')}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>Davet kodu ile bir gruba katilin</div>
              </div>
            </button>

            <DiscoveryList
              title={t('family.discoverTitle', 'Kesfedilen aileler')}
              subtitle={t('family.discoverSubtitle', 'Topluluga katilan aileleri gor, ilham al ve kendi ailenizi olusturun')}
              items={visibleDiscoveries}
              t={t}
            />
          </div>
        )}

        {mode === 'create' && (
          <div className="settings-card reveal-stagger p-24 flex flex-col items-stretch">
            <h4 style={{ margin: '0 0 20px 0', color: 'var(--nav-text)', fontWeight: '950' }}>{t('family.createAction')}</h4>
            <input type="text" className="w-full rounded-16" placeholder={t('family.familyNamePlaceholder')} value={inputVal} onChange={(e) => setInputVal(e.target.value)} style={{ marginBottom: '20px', padding: '16px 20px', background: 'var(--nav-hover)', border: '1px solid var(--nav-border)', color: 'var(--nav-text)', fontWeight: '700', outline: 'none' }} />
            <div className="flex gap-12">
              <button className="velocity-target-btn flex-1 p-16 justify-center" style={{ flex: 1 }} disabled={busy || !inputVal} onClick={async () => { setBusy(true); await createFamily(inputVal); setBusy(false); }}>
                {busy ? <Clock size={20} className="spin" /> : t('common.save')}
              </button>
              <button className="settings-card flex-1 p-16 justify-center font-extrabold" style={{ flex: 1, background: 'transparent' }} onClick={() => setMode('view')}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="settings-card reveal-stagger p-24 flex flex-col items-stretch">
            <h4 style={{ margin: '0 0 20px 0', color: 'var(--nav-text)', fontWeight: '950' }}>{t('family.joinAction')}</h4>
            <input type="text" className="w-full rounded-16 uppercase text-center" placeholder={t('family.codePlaceholder')} value={inputVal} onChange={(e) => setInputVal(e.target.value)} style={{ marginBottom: '20px', padding: '16px 20px', background: 'var(--nav-hover)', border: '1px solid var(--nav-border)', color: 'var(--nav-text)', fontWeight: '900', letterSpacing: '2px', fontSize: '1.25rem', outline: 'none' }} />
            <div className="flex gap-12">
              <button className="velocity-target-btn flex-1 p-16 justify-center" style={{ flex: 1 }} disabled={busy || !inputVal} onClick={async () => { setBusy(true); await joinFamily(inputVal); setBusy(false); }}>
                {busy ? <Clock size={20} className="spin" /> : t('family.joinAction')}
              </button>
              <button className="settings-card flex-1 p-16 justify-center font-extrabold" style={{ flex: 1, background: 'transparent' }} onClick={() => setMode('view')}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) return <div>{t('common.loading')}</div>;

  if (selectedMember) {
    return (
      <div className="settings-container reveal-stagger pb-120">
        <div className="flex items-center gap-16 mb-24">
          <IslamicBackButton onClick={() => setSelectedMember(null)} showLabel={true} label={t('common.back')} />
        </div>

        <div className="settings-card reveal-stagger mb-24 text-center flex flex-col items-stretch" style={{ padding: '32px 24px', background: 'var(--nav-hover)' }}>
          <div className="settings-icon-box rounded-24" style={{ width: '84px', height: '84px', background: 'var(--nav-accent)', margin: '0 auto 20px', color: 'white', fontSize: '2.5rem' }}>
            {selectedMember.displayName?.charAt(0) || 'U'}
          </div>
          <h2 style={{ margin: '0 0 4px 0', color: 'var(--nav-text)', fontWeight: '950', fontSize: '1.75rem' }}>{selectedMember.displayName}</h2>
          <div className="uppercase flex items-center justify-center gap-6" style={{ fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '800', letterSpacing: '0.5px' }}>
            {selectedMember.role === 'child' ? 'Cocuk' : 'Uye'}
          </div>
        </div>

        <BadgeGrid earnedBadges={selectedMember.earnedBadges} userStats={selectedMember} />
        <StreakDetail streaks={selectedMember.streaks} />
      </div>
    );
  }

  const renderWeeklyFocusCard = () => {
    if (!familyWeeklySummary) return null;

    return (
      <div className="settings-card reveal-stagger p-24 mb-24 flex flex-col items-stretch rounded-24" style={{ background: 'linear-gradient(145deg, var(--nav-bg), var(--nav-hover))', border: '1px solid rgba(249, 115, 22, 0.18)' }}>
        <div className="flex justify-between gap-16 mb-16 items-start">
          <div>
            <div className="uppercase mb-6" style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--nav-accent)', letterSpacing: '1px' }}>
              {sharedGoal?.title || familyWeeklySummary.recommendedGoal.title}
            </div>
            <h3 className="m-0" style={{ color: 'var(--nav-text)', fontWeight: '900', fontSize: '1.1rem' }}>
              Bu hafta ailene duzenli bir katki ritmi kur
            </h3>
            <p className="leading-relaxed" style={{ margin: '8px 0 0', color: 'var(--nav-text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
              {sharedGoal?.description || familyWeeklySummary.encouragement}
            </p>
          </div>
          <div className="text-center p-12 rounded-18" style={{ minWidth: '76px', background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.18)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '950', color: 'var(--nav-accent)' }}>
              %{sharedGoalProgress}
            </div>
            <div className="uppercase" style={{ fontSize: '0.62rem', fontWeight: '800', color: 'var(--nav-text-muted)' }}>
              Ritim
            </div>
          </div>
        </div>

        <div className="h-16 rounded-full overflow-hidden mb-12" style={{ background: 'rgba(0,0,0,0.12)' }}>
          <div style={{
            height: '100%',
            width: `${sharedGoalProgress}%`,
            background: 'linear-gradient(90deg, #f59e0b, #10b981)'
          }} />
        </div>

        <div className="flex items-center justify-between gap-12 mb-14">
          <div style={{ fontSize: '0.76rem', fontWeight: '700', color: 'var(--nav-text-muted)' }}>
            {Number(sharedGoal?.currentValue) || 0} / {Number(sharedGoal?.targetValue) || familyWeeklySummary.recommendedGoal.targetValue} adim
          </div>
          <button
            onClick={handleContribution}
            disabled={weeklyGoalLoading || alreadyContributedToday}
            className="hover-lift border-none rounded-16 flex items-center gap-8 font-black"
            style={{
              background: 'linear-gradient(135deg, var(--nav-accent), #10b981)',
              color: '#fff',
              padding: '10px 14px',
              cursor: weeklyGoalLoading ? 'wait' : alreadyContributedToday ? 'default' : 'pointer',
              opacity: weeklyGoalLoading || alreadyContributedToday ? 0.7 : 1
            }}
          >
            {weeklyGoalLoading ? <Clock size={16} className="spin" /> : <HeartHandshake size={16} />}
            {weeklyGoalLoading ? 'Guncelleniyor...' : alreadyContributedToday ? 'Bugunku katki kaydedildi' : 'Bugun katki yap'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div className="rounded-16 p-12" style={{ background: 'var(--nav-hover)', border: '1px solid var(--nav-border)' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: '950', color: 'var(--nav-text)' }}>{familyWeeklySummary.memberCount}</div>
            <div className="text-xs uppercase font-extrabold" style={{ color: 'var(--nav-text-muted)' }}>Uye</div>
          </div>
          <div className="rounded-16 p-12" style={{ background: 'var(--nav-hover)', border: '1px solid var(--nav-border)' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: '950', color: 'var(--nav-text)' }}>{familyWeeklySummary.familyStrength}</div>
            <div className="text-xs uppercase font-extrabold" style={{ color: 'var(--nav-text-muted)' }}>Seri gucu</div>
          </div>
          <div className="rounded-16 p-12" style={{ background: 'var(--nav-hover)', border: '1px solid var(--nav-border)' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: '950', color: 'var(--nav-text)' }}>{familyWeeklySummary.totalBadgeCount}</div>
            <div className="text-xs uppercase font-extrabold" style={{ color: 'var(--nav-text-muted)' }}>Rozet</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="settings-container reveal-stagger pb-120">
      <div className="flex items-center gap-16 mb-24">
        <IslamicBackButton onClick={onClose} showLabel={true} label={t('family.title')} />
      </div>

      <div className="settings-card reveal-stagger mb-32 border-none rounded-24 flex flex-row items-center gap-20 relative overflow-hidden" style={{ padding: '32px 24px', background: 'linear-gradient(135deg, var(--nav-accent) 0%, #f59e0b 100%)', color: 'white', boxShadow: '0 15px 35px rgba(249, 115, 22, 0.25)' }}>
        <Shield size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, transform: 'rotate(-15deg)' }} />

        <div className="flex-1 relative z-1">
          <h2 className="m-0 tracking-tight" style={{ color: 'white', fontWeight: '950', fontSize: '1.75rem' }}>{family?.name}</h2>
          <div className="mt-8 flex items-center gap-6" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', fontWeight: '700' }}>
            <Users size={16} />
            {t('family.membersCount', { count: family?.members?.length })}
          </div>
        </div>

        <div className="rounded-18 flex flex-col items-center relative z-1" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', padding: '12px 20px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.3)' }}>
          <span className="uppercase mb-4 opacity-80" style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px' }}>KOD</span>
          <b style={{ fontSize: '1.25rem', letterSpacing: '2px' }}>{family?.inviteCode}</b>
        </div>
      </div>

      {renderWeeklyFocusCard()}

      <h3 className="mb-20 uppercase flex items-center gap-10" style={{ fontSize: '1rem', color: 'var(--nav-text)', fontWeight: '900', letterSpacing: '0.5px' }}>
        <Users size={20} color="var(--nav-accent)" />
        {t('family.members')}
      </h3>

      <div className="reveal-stagger flex flex-col gap-12">
        {family?.membersDetails?.map((member, index) => (
          <MemberCard key={member.uid} member={member} isChild={member.role === 'child'} onClick={() => setSelectedMember(member)} style={{ '--delay': `${index * 0.05}s` }} />
        ))}
      </div>

      <div className="mt-40 text-center reveal-stagger">
        <div className="settings-card p-24 flex flex-col items-center" style={{ background: 'var(--nav-hover)', border: '1px dashed var(--nav-border)' }}>
          <div className="settings-icon-box mb-16" style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--nav-accent)' }}>
            <Share2 size={24} />
          </div>
          <p className="mb-8" style={{ fontSize: '0.95rem', color: 'var(--nav-text)', fontWeight: '700', margin: 0 }}>
            {t('family.inviteTip')}
          </p>
          <span style={{ fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>Detaylar icin uyeye tiklayin</span>
        </div>
      </div>

      <div className="mt-24 reveal-stagger">
        <DiscoveryList
          title={t('family.discoverTitle', 'Kesfedilen aileler')}
          subtitle={t('family.discoverSubtitle', 'Diger ailelerin adlarini gorerek kendi grubunu buyutmek icin ilham al.')}
          items={visibleDiscoveries}
          t={t}
        />
      </div>
    </div>
  );
};

export default FamilyDashboard;
