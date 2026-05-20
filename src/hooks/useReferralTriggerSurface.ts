import { useEffect, useMemo, useState } from "react";
import { getReferralServerSnapshot } from "../services/referralServerService";
import { getReferralProgress } from "../services/referralService";
import { buildReferralTriggerSurfacePlan } from "../services/referralTriggerSurfaceService";

interface UseReferralTriggerSurfaceOptions {
  surface?: string;
  enabled?: boolean;
  weeklyStats?: Record<string, unknown> | null;
  assistantMeta?: Record<string, unknown> | null;
}

interface ReferralProgress {
  [key: string]: unknown;
}

interface ReferralTriggerPlan {
  [key: string]: unknown;
}

export function useReferralTriggerSurface({
  surface = "home",
  enabled = true,
  weeklyStats = null,
  assistantMeta = null,
}: UseReferralTriggerSurfaceOptions = {}) {
  const [serverSnapshot, setServerSnapshot] = useState<Record<string, unknown> | null>(null);
  const localProgress: ReferralProgress = getReferralProgress();

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

  const plan = useMemo((): ReferralTriggerPlan | null => {
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
