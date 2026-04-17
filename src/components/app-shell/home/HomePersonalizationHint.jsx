import { TrendingUp } from 'lucide-react';

function HomePersonalizationHint() {
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
          Bu ekran artik sana gore siralaniyor
        </div>
        <div style={{ fontSize: '0.76rem', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>
          Ana odagini ayarlardan degistirdiginde home, menu ve hizli erisim kartlari yeni ritmine gore guncellenir.
        </div>
      </div>
    </div>
  );
}

export default HomePersonalizationHint;
