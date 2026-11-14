import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Mushaf back button (hz-iconbtn): one look on every screen. `color` and `variant` were never applied and stay ignored.
const SIZES = { small: { button: 36, icon: 18 }, medium: { button: 40, icon: 20 }, large: { button: 48, icon: 24 } };

const IslamicBackButton = ({ onClick, size = 'medium', showLabel = false, label }) => {
  const { t } = useTranslation();
  const s = SIZES[size] || SIZES.medium;
  const text = label || t('common.back', 'Geri');

  if (showLabel) {
    return (
      <button type="button" className="hz-btn hz-btn--ghost" onClick={onClick} style={{ minHeight: s.button, padding: '0 12px 0 4px' }}>
        <ChevronLeft size={s.icon} strokeWidth={1.75} aria-hidden="true" />
        {text}
      </button>
    );
  }

  return (
    <button type="button" className="hz-iconbtn" onClick={onClick} aria-label={text} style={{ width: s.button, height: s.button }}>
      <ChevronLeft size={s.icon} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
};

export default IslamicBackButton;
