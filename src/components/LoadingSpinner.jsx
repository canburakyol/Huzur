import { getLoadingLabel } from '../utils/loadingLabel';

function LoadingSpinner({ height = '100px', label = getLoadingLabel() }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="loading-spinner" aria-hidden="true" />
    </div>
  );
}

export default LoadingSpinner;
