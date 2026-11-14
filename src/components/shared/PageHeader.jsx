import IslamicBackButton from './IslamicBackButton';

// The one screen header of the Mushaf system: back button, left-aligned title, optional subtitle and one action.
const PageHeader = ({ title, subtitle, onBack, action = null }) => (
  <header className="hz-header">
    {onBack ? <IslamicBackButton onClick={onBack} /> : null}
    <h1 className="hz-header__title">
      {title}
      {subtitle ? <span className="hz-header__sub">{subtitle}</span> : null}
    </h1>
    {action}
  </header>
);

export default PageHeader;
