import { AlertTriangle, RotateCcw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Streak24hRecoveryModal = ({
  isOpen,
  categoryName,
  deadline,
  onConfirm,
  onClose
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const resolvedCategory = categoryName || t('streak24h.defaultCategory', 'Namaz');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10002,
        background: 'rgba(0,0,0,0.58)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 18,
          borderRadius: 16,
          background: 'rgba(20, 36, 30, 0.96)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} /> {t('streak24h.title', '24 Saat Telafi')}
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ margin: '0 0 10px', color: '#d9e6db', lineHeight: 1.6 }}>
          {t('streak24h.description', {
            category: resolvedCategory,
            defaultValue: '{{category}} serin bir gün kaçırılmış görünüyor. 24 saatlik pencerede telafi ederek serini koruyabilirsin.'
          })}
        </p>

        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#b7c8bb' }}>
          {t('streak24h.deadline', {
            value: deadline ? new Date(deadline).toLocaleString() : '-',
            defaultValue: 'Son telafi zamanı: {{value}}'
          })}
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              border: '1px solid #d4af37',
              background: '#d4af37',
              color: '#14352a',
              borderRadius: 10,
              padding: '10px 12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <RotateCcw size={16} /> {t('streak24h.recoverAction', 'Telafi Et')}
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              borderRadius: 10,
              padding: '10px 12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {t('streak24h.laterAction', 'Daha Sonra')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Streak24hRecoveryModal;
