function SettingsToggle({ active = false }) {
  return (
    <div className={`velocity-switch ${active ? 'active' : ''}`}>
      <div className="velocity-knob" />
    </div>
  );
}

export default SettingsToggle;
