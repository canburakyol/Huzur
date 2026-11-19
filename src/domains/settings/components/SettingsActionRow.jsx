import { ChevronRight } from 'lucide-react';

// One settings row in the Mushaf style. Pass `checked` for an on/off row: it then acts as a switch.
function SettingsActionRow({ checked, description, dimmed = false, icon, onClick, rightContent, title, tone }) {
  const isSwitch = typeof checked === 'boolean';
  const isDanger = tone === 'danger';

  return (
    <button
      type="button"
      className={`hz-row settings-row ${isDanger ? 'settings-row--danger' : ''}`}
      onClick={onClick}
      role={isSwitch ? 'switch' : undefined}
      aria-checked={isSwitch ? checked : undefined}
      style={dimmed ? { opacity: 0.6 } : undefined}
    >
      <span className="hz-row__icon" aria-hidden="true">{icon}</span>
      <span className="hz-row__text">
        <span className="hz-row__title">{title}</span>
        {description ? <span className="hz-label">{description}</span> : null}
      </span>
      {rightContent || <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" style={{ flex: 'none', color: 'var(--ink-muted)' }} />}
    </button>
  );
}

export default SettingsActionRow;
