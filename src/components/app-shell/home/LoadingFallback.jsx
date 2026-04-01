import LoadingSpinner from '../../LoadingSpinner';

function LoadingFallback({ height = '100px' }) {
  return <LoadingSpinner height={height} />;
}

export default LoadingFallback;
