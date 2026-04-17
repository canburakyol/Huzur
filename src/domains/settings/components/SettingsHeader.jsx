import IslamicBackButton from '../../../components/shared/IslamicBackButton';

function SettingsHeader({ onClose, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
      <IslamicBackButton onClick={onClose} size="medium" />
      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)' }}>
        {title}
      </h2>
    </div>
  );
}

export default SettingsHeader;
