import { useTranslation } from 'react-i18next';

/**
 * SplashScreen Component
 * Displays a spiritual welcome screen on first session load
 */
const SplashScreen = ({ onHide }) => {
  const { t } = useTranslation();

  return (
    <div
      onClick={onHide}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, cursor: 'pointer', padding: '20px'
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-color) 0%, rgba(212, 165, 116, 0.95) 100%)',
        padding: '32px 24px', borderRadius: '20px', maxWidth: '340px',
        textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🕌</div>
        <div style={{ fontFamily: "'Amiri', serif", fontSize: '24px', color: '#fff', marginBottom: '16px' }}>
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
        </div>
        <div style={{ fontFamily: "'Amiri', serif", fontSize: '20px', color: '#fff', marginBottom: '12px', lineHeight: '1.5' }}>
          رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '20px', fontStyle: 'italic' }}>
          "{t('splash.translation')}"
          <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.8 }}>{t('splash.reference')}</div>
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', display: 'inline-block' }}>
          {t('splash.tapToContinue')}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
