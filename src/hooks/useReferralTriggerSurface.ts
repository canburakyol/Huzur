import { useEffect, useMemo, useState } from "react";
import { getReferralServerSnapshot } from "../services/referralServerService";
import { getReferralProgress } from "../services/referralService";
import { buildReferralTriggerSurfacePlan } from "../services/referralTriggerSurfaceService";

type UseReferralTriggerSurfaceOptions = {
  surface?: string;
  enabled?: boolean;
  weeklyStats?: Record<string, unknown> | null;
  assistantMeta?: Record<string, unknown> | null;
}

export function useReferralTriggerSurface({
  surface = "home",
  enabled = true,
  weeklyStats = null,
  assistantMeta = null,
}: UseReferralTriggerSurfaceOptions = {}) {
  const [serverSnapshot, setServerSnapshot] = useState<Awaited<ReturnType<typeof getReferralServerSnapshot>> | null>(null);
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
      weeklyStats: weeklyStats ?? undefined,
      assistantMeta: assistantMeta ?? undefined,
    });
  }, [assistantMeta, enabled, localProgress, serverSnapshot, surface, weeklyStats]);

  return {
    plan,
    localProgress,
    serverSnapshot,
  };
}

export default useReferralTriggerSurface;
