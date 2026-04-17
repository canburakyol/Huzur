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

const HEALTH_PALETTE = {
  healthy: {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.18)',
    color: '#10b981',
    label: 'Saglam'
  },
  watch: {
    bg: 'rgba(212, 175, 55, 0.12)',
    border: 'rgba(212, 175, 55, 0.22)',
    color: '#d4af37',
    label: 'Izle'
  },
  action: {
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.22)',
    color: '#f97316',
    label: 'Dikkat'
  }
};

const ROLLOUT_THEME = {
  go: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Devam et' },
  cautious: { bg: 'rgba(212, 175, 55, 0.12)', color: '#d4af37', label: 'Izleyerek devam et' },
  hold: { bg: 'rgba(249, 115, 22, 0.12)', color: '#f97316', label: 'Yavaslat' }
};

const RELEASE_READINESS_THEME = {
  ready: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Hazir' },
  monitor: { bg: 'rgba(212, 175, 55, 0.12)', color: '#d4af37', label: 'Izlenmeli' },
  blocked: { bg: 'rgba(249, 115, 22, 0.12)', color: '#f97316', label: 'Beklet' }
};

const RELEASE_BRIEF_THEME = {
  healthy: {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.16)',
    color: '#10b981'
  },
  watch: {
    bg: 'rgba(212, 175, 55, 0.12)',
    border: 'rgba(212, 175, 55, 0.18)',
    color: '#d4af37'
  },
  critical: {
    bg: 'rgba(249, 115, 22, 0.1)',
    border: 'rgba(249, 115, 22, 0.16)',
    color: '#f97316'
  }
};

export function useAiHealthPanel() {
  const [aiHealthSummary, setAiHealthSummary] = useState(null);
  const [aiFeatureFlags, setAiFeatureFlags] = useState(null);
  const [aiIncidentSummary, setAiIncidentSummary] = useState(null);
  const [aiGlobalReleaseStatus, setAiGlobalReleaseStatus] = useState(null);

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
    globalReleaseTheme: HEALTH_PALETTE[aiGlobalReleaseStatus?.status || 'watch'],
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
