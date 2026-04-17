import { Suspense, lazy } from 'react';
import LoadingFallback from './LoadingFallback';

const Stories = lazy(() => import('../../Stories'));

function HomeStoriesStrip() {
  return (
    <div
      style={{
        margin: '0 5px 16px',
        padding: '10px 14px 4px',
        borderRadius: '24px',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      <div style={{ fontSize: '0.72rem', fontWeight: '900', color: 'var(--nav-accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '2px' }}>
        Hikayeler
      </div>
      <Suspense fallback={<LoadingFallback height="100px" />}>
        <Stories />
      </Suspense>
    </div>
  );
}

export default HomeStoriesStrip;
