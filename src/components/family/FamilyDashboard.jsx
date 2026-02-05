import React, { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { useTranslation } from 'react-i18next';
import MemberCard from './MemberCard';
import IslamicBackButton from '../shared/IslamicBackButton';
import BadgeGrid from '../gamification/BadgeGrid';
import StreakDetail from '../gamification/StreakDetail';

const FamilyDashboard = ({ onClose }) => {
  const { family, loading, error, createFamily, joinFamily } = useFamily();
  const { t } = useTranslation();
  
  const [mode, setMode] = useState('view'); // view, create, join
  const [selectedMember, setSelectedMember] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [busy, setBusy] = useState(false);

  // Aile yoksa Creation/Join ekranı
  if (!family && !loading) {
    return (
      <div className="family-dashboard glass-card" style={{ padding: '20px', margin: '15px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 10 }}>
          <IslamicBackButton onClick={onClose} size="small" />
        </div>
        <h3 style={{ marginTop: 0, color: 'var(--primary-color)', marginLeft: '35px' }}>{t('family.title')}</h3>
        <p style={{ color: 'var(--text-color-muted)' }}>{t('family.intro')}</p>

        {error && <div style={{ color: '#e74c3c', marginBottom: '10px', padding: '10px', background: 'rgba(231, 76, 60, 0.1)', borderRadius: '8px' }}>{error}</div>}

        {mode === 'view' && (
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button className="btn btn-primary" onClick={() => setMode('create')}>
              {t('family.createAction')}
            </button>
            <button className="btn" style={{ background: '#eee' }} onClick={() => setMode('join')}>
              {t('family.joinAction')}
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div>
            <input 
              type="text" 
              placeholder={t('family.familyNamePlaceholder')}
              className="form-control"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{ 
                width: '100%', 
                marginBottom: '10px', 
                padding: '12px',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--text-color)',
                borderRadius: '12px'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-primary" 
                disabled={busy || !inputVal}
                onClick={async () => {
                  setBusy(true);
                  await createFamily(inputVal);
                  setBusy(false);
                }}
              >
                {busy ? '...' : t('common.save')}
              </button>
              <button className="btn" onClick={() => setMode('view')}>{t('common.cancel')}</button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div>
            <input 
              type="text" 
              placeholder={t('family.codePlaceholder')}
              className="form-control"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{ 
                width: '100%', 
                marginBottom: '10px', 
                padding: '12px', 
                textTransform: 'uppercase',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--text-color)',
                borderRadius: '12px'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-primary" 
                disabled={busy || !inputVal}
                onClick={async () => {
                  setBusy(true);
                  await joinFamily(inputVal);
                  setBusy(false);
                }}
              >
                {busy ? '...' : t('family.joinAction')}
              </button>
              <button className="btn" onClick={() => setMode('view')}>{t('common.cancel')}</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) return <div>{t('common.loading')}</div>;

  // Detay Görünümü
  if (selectedMember) {
    return (
      <div className="family-dashboard" style={{ padding: '15px' }}>
        <div style={{ padding: '0 15px 15px 5px' }}>
           <IslamicBackButton onClick={() => setSelectedMember(null)} showLabel={true} label={t('common.back')} />
        </div>

        <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', background: 'var(--card-bg)', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 5px 0', color: 'var(--primary-color)' }}>{selectedMember.displayName}</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-color-muted)' }}>
             {selectedMember.role === 'child' ? t('family.child') : t('common.user')}
          </span>
        </div>

        <BadgeGrid 
          earnedBadges={selectedMember.earnedBadges} 
          userStats={selectedMember} 
        />

        <StreakDetail streaks={selectedMember.streaks} />
      </div>
    );
  }

  return (
    <div className="family-dashboard" style={{ padding: '15px' }}>
      <div style={{ padding: '0 15px 15px 5px' }}>
         <IslamicBackButton onClick={onClose} showLabel={true} label={t('family.title')} />
      </div>
      <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', background: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>{family?.name}</h2>
          <span style={{ 
            background: 'var(--input-bg)', 
            color: 'var(--text-color)',
            padding: '5px 10px', 
            borderRadius: '15px', 
            fontSize: '12px', 
            border: '1px solid var(--glass-border)' 
          }}>
            Kod: <b>{family?.inviteCode}</b>
          </span>
        </div>
        <p style={{ marginTop: '5px', fontSize: '13px', color: 'var(--text-color-muted)' }}>
          {t('family.membersCount', { count: family?.members?.length })}
        </p>
      </div>

      <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>{t('family.members')}</h3>
      
      {family?.membersDetails?.map(member => (
        <MemberCard 
          key={member.uid} 
          member={member} 
          isChild={member.role === 'child'} 
          onClick={() => setSelectedMember(member)}
        />
      ))}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-color-muted)' }}>
          {t('family.inviteTip')}
          <br/>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>Detaylar için üyeye tıklayın</span>
        </p>
      </div>
    </div>
  );
};

export default FamilyDashboard;
