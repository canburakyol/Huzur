// Visual only: the row around it carries role="switch" and aria-checked.
function SettingsToggle({ active = false }) {
  return (
    <span className={`settings-switch ${active ? 'is-on' : ''}`} aria-hidden="true">
      <span className="settings-switch__knob" />
    </span>
  );
}

export default SettingsToggle;
