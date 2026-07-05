import { useEffect, useMemo, useState } from 'react';

import { buildAiHealthSummary } from '../../../services/aiHealthDiagnosticsService';
import { getAiFeatureFlags } from '../../../services/aiFeatureFlagService';
import { getAiGlobalReleaseStatus } from '../../../services/aiGlobalReleaseStatusService';
import { getAiHealthSnapshots } from '../../../services/aiHealthSnapshotService';
import { getAiIncidentSummary } from '../../../services/aiIncidentService';
import { buildAiOpsChecklist } from '../../../services/aiOpsChecklistService';
import { buildAiReleaseBrief } from '../../../services/aiReleaseBriefService';
import { buildAiReleaseReadiness } from '../../../services/aiReleaseReadinessService';
import { buildAiRolloutGate } from '../../../services/aiRolloutGateService';
import { logAiHealthPanelViewed, logAiReleaseReadinessSurfaced } from '../../../services/analyticsService';

const HEALTH_PALETTE: Record<string, { bg: string; border: string; color: string; label: string }> = {
  healthy: {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.18)',
    color: 'var(--secondary)',
    label: 'Saglam'
  },
  watch: {
    bg: 'rgba(212, 175, 55, 0.12)',
    border: 'rgba(212, 175, 55, 0.22)',
    color: 'var(--tertiary)',
    label: 'Izle'
  },
  action: {
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.22)',
    color: 'var(--error)',
    label: 'Dikkat'
  }
};

const ROLLOUT_THEME: Record<string, { bg: string; color: string; label: string }> = {
  go: { bg: 'color-mix(in srgb, var(--secondary) 10%, transparent)', color: 'var(--secondary)', label: 'Devam et' },
  cautious: { bg: 'color-mix(in srgb, var(--tertiary) 12%, transparent)', color: 'var(--tertiary)', label: 'Izleyerek devam et' },
  hold: { bg: 'color-mix(in srgb, var(--error) 12%, transparent)', color: 'var(--error)', label: 'Yavaslat' }
};

const RELEASE_READINESS_THEME: Record<string, { bg: string; color: string; label: string }> = {
  ready: { bg: 'color-mix(in srgb, var(--secondary) 10%, transparent)', color: 'var(--secondary)', label: 'Hazir' },
  monitor: { bg: 'color-mix(in srgb, var(--tertiary) 12%, transparent)', color: 'var(--tertiary)', label: 'Izlenmeli' },
  blocked: { bg: 'color-mix(in srgb, var(--error) 12%, transparent)', color: 'var(--error)', label: 'Beklet' }
};

const RELEASE_BRIEF_THEME: Record<string, { bg: string; border: string; color: string }> = {
  healthy: {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.16)',
    color: 'var(--secondary)'
  },
  watch: {
    bg: 'rgba(212, 175, 55, 0.12)',
    border: 'rgba(212, 175, 55, 0.18)',
    color: 'var(--tertiary)'
  },
  critical: {
    bg: 'rgba(249, 115, 22, 0.1)',
    border: 'rgba(249, 115, 22, 0.16)',
    color: 'var(--error)'
  }
};

export function useAiHealthPanel() {
  const [aiHealthSummary, setAiHealthSummary] = useState<ReturnType<typeof buildAiHealthSummary> | null>(null);
  const [aiFeatureFlags, setAiFeatureFlags] = useState<Record<string, unknown> | null>(null);
  const [aiIncidentSummary, setAiIncidentSummary] = useState<ReturnType<typeof getAiIncidentSummary> | null>(null);
  const [aiGlobalReleaseStatus, setAiGlobalReleaseStatus] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAiHealth = async () => {
      const [health, flags, globalStatus] = await Promise.all([
        getAiHealthSnapshots(),
        getAiFeatureFlags(),
        getAiGlobalReleaseStatus()
      ]);

      if (!isMounted) {
        return;
      }

      const summary = buildAiHealthSummary(health);
      setAiHealthSummary(summary);
      setAiFeatureFlags(flags);
      setAiGlobalReleaseStatus(globalStatus);
      setAiIncidentSummary(getAiIncidentSummary());
      logAiHealthPanelViewed(summary.overallStatus, summary.watchCount, summary.actionCount);
    };

    void loadAiHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  const rolloutGate = useMemo(() => (
    aiHealthSummary
      ? buildAiRolloutGate({
          healthSummary: aiHealthSummary,
          flags: aiFeatureFlags || {}
        })
      : null
  ), [aiFeatureFlags, aiHealthSummary]);

  const releaseReadiness = useMemo(() => (
    aiHealthSummary
      ? buildAiReleaseReadiness({
          healthSummary: aiHealthSummary,
          rolloutGate,
          incidentSummary: aiIncidentSummary,
          flags: aiFeatureFlags || {}
        })
      : null
  ), [aiFeatureFlags, aiHealthSummary, aiIncidentSummary, rolloutGate]);

  useEffect(() => {
    if (!aiHealthSummary || !rolloutGate || !releaseReadiness) {
      return;
    }

    logAiReleaseReadinessSurfaced(
      releaseReadiness.status,
      rolloutGate.recommendation,
      aiHealthSummary.actionCount,
      aiHealthSummary.watchCount,
      aiIncidentSummary?.last24hCount || 0
    );
  }, [aiHealthSummary, aiIncidentSummary, releaseReadiness, rolloutGate]);

  const aiOpsChecklist = useMemo(() => (
    aiHealthSummary
      ? buildAiOpsChecklist({
          healthSummary: aiHealthSummary,
          rolloutGate,
          releaseReadiness,
          incidentSummary: aiIncidentSummary,
          flags: aiFeatureFlags || {}
        })
      : null
  ), [aiFeatureFlags, aiHealthSummary, aiIncidentSummary, releaseReadiness, rolloutGate]);

  const aiReleaseBrief = useMemo(() => (
    aiHealthSummary
      ? buildAiReleaseBrief({
          healthSummary: aiHealthSummary,
          rolloutGate,
          releaseReadiness,
          opsChecklist: aiOpsChecklist,
          incidentSummary: aiIncidentSummary,
          globalStatus: aiGlobalReleaseStatus,
          flags: aiFeatureFlags || {}
        })
      : null
  ), [
    aiFeatureFlags,
    aiGlobalReleaseStatus,
    aiHealthSummary,
    aiIncidentSummary,
    aiOpsChecklist,
    releaseReadiness,
    rolloutGate
  ]);

  return {
    aiGlobalReleaseStatus,
    aiHealthSummary,
    aiIncidentSummary,
    aiOpsChecklist,
    aiReleaseBrief,
    globalReleaseTheme: HEALTH_PALETTE[aiGlobalReleaseStatus?.status as string || 'watch'],
    overallHealthTheme: HEALTH_PALETTE[aiHealthSummary?.overallStatus || 'watch'],
    releaseBriefTheme: RELEASE_BRIEF_THEME[aiReleaseBrief?.tone || 'watch'],
    releaseReadiness,
    releaseReadinessTheme: RELEASE_READINESS_THEME[releaseReadiness?.status || 'monitor'],
    rolloutGate,
    rolloutGateTheme: ROLLOUT_THEME[rolloutGate?.recommendation || 'cautious'],
    surfacePalette: HEALTH_PALETTE
  };
}

export default useAiHealthPanel;
