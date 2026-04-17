import { ChevronRight } from 'lucide-react';

function SettingsActionRow({
  chevronColor = 'var(--nav-border)',
  description,
  icon,
  iconStyle,
  onClick,
  rightContent,
  style,
  title,
  titleStyle
}) {
  return (
    <div className="settings-card premium-glass hover-lift" onClick={onClick} style={style}>
      <div className="settings-card-left">
        <div className="settings-icon-box" style={iconStyle}>
          {icon}
        </div>
        <div>
          <div className="settings-label" style={titleStyle}>
            {title}
          </div>
          {description ? <div className="settings-desc">{description}</div> : null}
        </div>
      </div>
      {rightContent || <ChevronRight size={18} color={chevronColor} />}
    </div>
  );
}

export default SettingsActionRow;
