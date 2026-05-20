import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import NotificationHistory from '../../system/components/NotificationHistory';

function SettingsHistoryScreen({ onClose, title }) {
  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 overflow-y-auto">
      <div className="p-4 bg-white dark:bg-gray-800 shadow-md mb-4 sticky top-0 z-10 flex items-center gap-3">
        <IslamicBackButton onClick={onClose} size="medium" />
        <h2 className="text-xl font-bold" style={{ margin: 0 }}>
          {title}
        </h2>
      </div>
      <NotificationHistory />
    </div>
  );
}

export default SettingsHistoryScreen;
