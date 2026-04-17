import { useEffect, useMemo, useState } from 'react';
import { getReferralServerSnapshot } from '../services/referralServerService';
import { getReferralProgress } from '../services/referralService';
import { buildReferralTriggerSurfacePlan } from '../services/referralTriggerSurfaceService';

export function useReferralTriggerSurface({
  surface = 'home',
  enabled = true,
  weeklyStats = null,
  assistantMeta = null,
} = {}) {
  const [serverSnapshot, setServerSnapshot] = useState(null);
  const localProgress = getReferralProgress();

  useEffect(() => {
    if (!enabled) return undefined;

    let isMounted = true;

    const loadSnapshot = async () => {
      const snapshot = await getReferralServerSnapshot();
      if (isMounted && snapshot) {
        setServerSnapshot(snapshot);
      }
    };

    void loadSnapshot();

    return () => {
      isMounted = false;
    };
  }, [enabled, surface]);

  const plan = useMemo(() => {
    if (!enabled) {
      return null;
    }

    return buildReferralTriggerSurfacePlan({
      surface,
      localProgress,
      serverSnapshot,
      weeklyStats,
      assistantMeta,
    });
  }, [assistantMeta, enabled, localProgress, serverSnapshot, surface, weeklyStats]);

  return {
    plan,
    localProgress,
    serverSnapshot,
  };
}

export default useReferralTriggerSurface;
