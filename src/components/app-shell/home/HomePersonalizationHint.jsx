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
      background: 'color-mix(in srgb, var(--surface-bright) 3%, transparent)',
      border: '1px solid var(--nav-border)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 14,
        background: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <TrendingUp size={18} color="var(--surface-container)" />
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
