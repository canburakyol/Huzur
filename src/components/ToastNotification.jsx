import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

const ToastNotification = ({ message, type = 'error', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    error: <AlertCircle size={20} />,
    success: <CheckCircle size={20} />,
    info: <Info size={20} />
  };

  const colors = {
    error: '#ef4444',
    success: '#10b981',
    info: '#3b82f6'
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      background: `linear-gradient(135deg, ${colors[type]}15, ${colors[type]}25)`,
      border: `1px solid ${colors[type]}40`,
      borderRadius: '12px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '300px',
      maxWidth: '400px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      animation: 'slideInRight 0.3s ease-out'
    }}>
      <div style={{ color: colors[type] }}>
        {icons[type]}
      </div>
      <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: '14px' }}>
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: colors[type],
          cursor: 'pointer',
          padding: '4px'
        }}
      >
        <X size={18} />
      </button>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ToastNotification;
