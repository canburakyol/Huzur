import PageHeader from '../../../components/shared/PageHeader';
import NotificationHistory from '../../system/components/NotificationHistory';

function SettingsHistoryScreen({ onClose, title }) {
  return (
    <div className="hz-root" style={{ position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 1, borderBottom: '1px solid var(--line)' }}>
        <PageHeader title={title} onBack={onClose} />
      </div>
      <NotificationHistory />
    </div>
  );
}

export default SettingsHistoryScreen;
