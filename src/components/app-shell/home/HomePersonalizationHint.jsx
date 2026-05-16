import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react';

const HomePersonalizationHint = memo(function HomePersonalizationHint() {
  const { t } = useTranslation();
  return (
    <div style={{
      margin: '0 5px 16px',
      padding: '16px 18px',
      borderRadius: '20px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--nav-border)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 14,
        background: 'rgba(15, 118, 110, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <TrendingUp size={18} color="var(--bg-emerald-light)" />
      </div>
      <div>
        <div style={{ fontSize: '0.84rem', fontWeight: '900', color: 'var(--nav-text)', marginBottom: 4 }}>
          {t('homeFeed.personalization.title')}
        </div>
        <div style={{ fontSize: '0.76rem', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>
          {t('homeFeed.personalization.description')}
        </div>
      </div>
    </div>
  );
});

export default HomePersonalizationHint;
