import React, { useMemo, useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { useTranslation } from 'react-i18next';
import MemberCard from './MemberCard';
import IslamicBackButton from '../shared/IslamicBackButton';
import BadgeGrid from '../gamification/BadgeGrid';
import StreakDetail from '../gamification/StreakDetail';
import { Users, UserPlus, Shield, Activity, Clock, Share2, Sparkles } from 'lucide-react';

const DiscoveryList = ({ title, subtitle, items, t }) => {
  if (!items?.length) return null;

  return (
    <div className="settings-card" style={{ padding: '24px', flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}>
      <div>
        <div style={{ fontWeight: '900', color: 'var(--nav-text)', fontSize: '1.05rem' }}>{title}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--nav-text-muted)', fontWeight: '600', marginTop: '4px' }}>{subtitle}</div>
      </div>
      <div className="sanctuary-stack-list">
        {items.map((publicFamily) => (
          <div key={publicFamily.id} className="settings-card sanctuary-family-discovery-card" style={{ padding: '18px 20px', background: 'var(--nav-hover)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <div style={{ flex: 1 }}>
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
  const { family, publicFamilies, loading, error, createFamily, joinFamily } = useFamily();
  const { t } = useTranslation();

  const [mode, setMode] = useState('view');
  const [selectedMember, setSelectedMember] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [busy, setBusy] = useState(false);

  const visibleDiscoveries = useMemo(() => {
    return (publicFamilies || []).filter((item) => item.id !== family?.id);
  }, [publicFamilies, family?.id]);

  if (!family && !loading) {
    return (
      <div className="settings-container reveal-stagger" style={{ paddingBottom: '120px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <IslamicBackButton onClick={onClose} size="medium" />
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--nav-text)', fontWeight: '950', letterSpacing: '-0.5px' }}>
            {t('family.title')}
          </h2>
        </div>

        <div className="settings-card reveal-stagger" style={{ padding: '32px 24px', flexDirection: 'column', alignItems: 'stretch', background: 'linear-gradient(135deg, var(--nav-accent) 0%, #f59e0b 100%)', color: 'white', border: 'none', boxShadow: '0 15px 35px rgba(249, 115, 22, 0.25)', borderRadius: '28px', marginBottom: '24px' }}>
          <div className="settings-icon-box" style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.2)', borderRadius: '18px', marginBottom: '20px', color: 'white' }}>
            <Users size={32} />
          </div>
          <h3 style={{ margin: '0 0 8px 0', color: 'white', fontWeight: '950', fontSize: '1.5rem' }}>{t('family.title')}</h3>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', fontWeight: '600', lineHeight: '1.5', marginBottom: '0' }}>{t('family.intro')}</p>
        </div>

        {error && (
          <div className="settings-card pulse" style={{ color: '#ef4444', marginBottom: '24px', padding: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', fontWeight: '800', fontSize: '0.9rem', justifyContent: 'center' }}>
            {error}
          </div>
        )}

        {mode === 'view' && (
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }} className="reveal-stagger">
            <button className="settings-card" onClick={() => setMode('create')} style={{ padding: '24px', background: 'var(--nav-hover)', border: '1px solid var(--nav-border)' }}>
              <div className="settings-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '14px' }}>
                <UserPlus size={24} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: '900', color: 'var(--nav-text)', fontSize: '1.1rem' }}>{t('family.createAction')}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>Yeni bir aile grubu olusturun</div>
              </div>
            </button>
            <button className="settings-card" onClick={() => setMode('join')} style={{ padding: '24px', background: 'var(--nav-hover)', border: '1px solid var(--nav-border)' }}>
              <div className="settings-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '14px' }}>
                <Activity size={24} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
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
          <div className="settings-card reveal-stagger" style={{ padding: '24px', flexDirection: 'column', alignItems: 'stretch' }}>
            <h4 style={{ margin: '0 0 20px 0', color: 'var(--nav-text)', fontWeight: '950' }}>{t('family.createAction')}</h4>
            <input type="text" placeholder={t('family.familyNamePlaceholder')} value={inputVal} onChange={(e) => setInputVal(e.target.value)} style={{ width: '100%', marginBottom: '20px', padding: '16px 20px', background: 'var(--nav-hover)', border: '1px solid var(--nav-border)', color: 'var(--nav-text)', borderRadius: '16px', fontWeight: '700', outline: 'none' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="velocity-target-btn" style={{ flex: 1, padding: '16px', justifyContent: 'center' }} disabled={busy || !inputVal} onClick={async () => { setBusy(true); await createFamily(inputVal); setBusy(false); }}>
                {busy ? <Clock size={20} className="spin" /> : t('common.save')}
              </button>
              <button className="settings-card" style={{ flex: 1, padding: '16px', justifyContent: 'center', fontWeight: '800', background: 'transparent' }} onClick={() => setMode('view')}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="settings-card reveal-stagger" style={{ padding: '24px', flexDirection: 'column', alignItems: 'stretch' }}>
            <h4 style={{ margin: '0 0 20px 0', color: 'var(--nav-text)', fontWeight: '950' }}>{t('family.joinAction')}</h4>
            <input type="text" placeholder={t('family.codePlaceholder')} value={inputVal} onChange={(e) => setInputVal(e.target.value)} style={{ width: '100%', marginBottom: '20px', padding: '16px 20px', textTransform: 'uppercase', background: 'var(--nav-hover)', border: '1px solid var(--nav-border)', color: 'var(--nav-text)', borderRadius: '16px', fontWeight: '900', letterSpacing: '2px', textAlign: 'center', fontSize: '1.25rem', outline: 'none' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="velocity-target-btn" style={{ flex: 1, padding: '16px', justifyContent: 'center' }} disabled={busy || !inputVal} onClick={async () => { setBusy(true); await joinFamily(inputVal); setBusy(false); }}>
                {busy ? <Clock size={20} className="spin" /> : t('family.joinAction')}
              </button>
              <button className="settings-card" style={{ flex: 1, padding: '16px', justifyContent: 'center', fontWeight: '800', background: 'transparent' }} onClick={() => setMode('view')}>
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
      <div className="settings-container reveal-stagger" style={{ paddingBottom: '120px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <IslamicBackButton onClick={() => setSelectedMember(null)} showLabel={true} label={t('common.back')} />
        </div>

        <div className="settings-card reveal-stagger" style={{ padding: '32px 24px', marginBottom: '24px', background: 'var(--nav-hover)', textAlign: 'center', flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="settings-icon-box" style={{ width: '84px', height: '84px', background: 'var(--nav-accent)', borderRadius: '24px', margin: '0 auto 20px', color: 'white', fontSize: '2.5rem' }}>
            {selectedMember.displayName?.charAt(0) || '👤'}
          </div>
          <h2 style={{ margin: '0 0 4px 0', color: 'var(--nav-text)', fontWeight: '950', fontSize: '1.75rem' }}>{selectedMember.displayName}</h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {selectedMember.role === 'child' ? '👶' : '👨‍👩‍👧'}
            {selectedMember.role === 'child' ? t('family.child') : t('common.user')}
          </div>
        </div>

        <BadgeGrid earnedBadges={selectedMember.earnedBadges} userStats={selectedMember} />
        <StreakDetail streaks={selectedMember.streaks} />
      </div>
    );
  }

  return (
    <div className="settings-container reveal-stagger" style={{ paddingBottom: '120px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <IslamicBackButton onClick={onClose} showLabel={true} label={t('family.title')} />
      </div>

      <div className="settings-card reveal-stagger" style={{ padding: '32px 24px', marginBottom: '32px', background: 'linear-gradient(135deg, var(--nav-accent) 0%, #f59e0b 100%)', color: 'white', border: 'none', borderRadius: '28px', boxShadow: '0 15px 35px rgba(249, 115, 22, 0.25)', flexDirection: 'row', alignItems: 'center', gap: '20px', position: 'relative', overflow: 'hidden' }}>
        <Shield size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, transform: 'rotate(-15deg)' }} />

        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <h2 style={{ margin: 0, color: 'white', fontWeight: '950', fontSize: '1.75rem', letterSpacing: '-0.5px' }}>{family?.name}</h2>
          <div style={{ marginTop: '8px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} />
            {t('family.membersCount', { count: family?.members?.length })}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', padding: '12px 20px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.3)', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', opacity: 0.8 }}>KOD</span>
          <b style={{ fontSize: '1.25rem', letterSpacing: '2px' }}>{family?.inviteCode}</b>
        </div>
      </div>

      <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: 'var(--nav-text)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Users size={20} color="var(--nav-accent)" />
        {t('family.members')}
      </h3>

      <div className="reveal-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {family?.membersDetails?.map((member, index) => (
          <MemberCard key={member.uid} member={member} isChild={member.role === 'child'} onClick={() => setSelectedMember(member)} style={{ '--delay': `${index * 0.05}s` }} />
        ))}
      </div>

      <div style={{ marginTop: '48px', textAlign: 'center' }} className="reveal-stagger">
        <div className="settings-card" style={{ padding: '24px', background: 'var(--nav-hover)', flexDirection: 'column', alignItems: 'center', border: '1px dashed var(--nav-border)' }}>
          <div className="settings-icon-box" style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--nav-accent)', marginBottom: '16px' }}>
            <Share2 size={24} />
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--nav-text)', fontWeight: '700', margin: '0 0 8px 0' }}>
            {t('family.inviteTip')}
          </p>
          <span style={{ fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>Detaylar icin uyeye tiklayin</span>
        </div>
      </div>

      <div style={{ marginTop: '24px' }} className="reveal-stagger">
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
