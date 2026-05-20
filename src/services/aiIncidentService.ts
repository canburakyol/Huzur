import { STORAGE_KEYS } from '../constants';
import errorHandler from './errorHandler';
import { storageService } from './storageService';

interface AiIncidentMetadata {
  [key: string]: string | number | boolean;
}

interface AiIncident {
  id: string;
  kind: string;
  stage: string;
  severity: 'critical' | 'warning';
  code: string | null;
  message: string | null;
  at: string;
  metadata: AiIncidentMetadata;
}

interface AiIncidentSummary {
  totalCount: number;
  last24hCount: number;
  criticalCount: number;
  latestIncident: AiIncident | null;
}

const MAX_INCIDENTS = 25;
const CRITICAL_STAGES = new Set(['callable_failed', 'response_invalid']);

const sanitizeText = (value: unknown, maxLength = 120): string | null => {
  if (typeof value !== 'string') return null;
  return value.trim().slice(0, maxLength) || null;
};

const sanitizeMetadata = (metadata: unknown = {}): AiIncidentMetadata => {
  if (!metadata || typeof metadata !== 'object') return {};

  const safe: AiIncidentMetadata = {};
  Object.entries(metadata as Record<string, unknown>).forEach(([key, value]) => {
    if (typeof value === 'boolean') {
      safe[key] = value;
      return;
    }
    if (Number.isFinite(Number(value))) {
      safe[key] = Number(value);
      return;
    }
    if (typeof value === 'string') {
      safe[key] = value.slice(0, 80);
    }
  });

  return safe;
};

const readIncidentStore = (): AiIncident[] => {
  const stored = storageService.getItem<AiIncident[]>(STORAGE_KEYS.AI_INCIDENTS, []);
  return Array.isArray(stored) ? stored : [];
};

const writeIncidentStore = (incidents: AiIncident[]): void => {
  storageService.setItem(STORAGE_KEYS.AI_INCIDENTS, incidents.slice(0, MAX_INCIDENTS));
};

export const recordAiIncident = (kind: string, stage: string, error: Error | null = null, metadata: Record<string, unknown> = {}): AiIncident => {
  const incident: AiIncident = {
    id: `${kind}_${stage}_${Date.now()}`,
    kind: sanitizeText(kind, 40) || 'unknown',
    stage: sanitizeText(stage, 40) || 'unknown',
    severity: CRITICAL_STAGES.has(stage) ? 'critical' : 'warning',
    code: sanitizeText(error?.code ? String(error.code) : '', 40),
    message: sanitizeText(error?.message || (metadata as Record<string, string>)?.reason || 'AI incident', 140),
    at: new Date().toISOString(),
    metadata: sanitizeMetadata(metadata),
  };

  const next = [incident, ...readIncidentStore()];
  writeIncidentStore(next);

  if (error) {
    errorHandler.log(error, `ai_${incident.kind}_${incident.stage}`, {
      ai_kind: incident.kind,
      ai_stage: incident.stage,
      ...incident.metadata,
    });
  }

  return incident;
};

export const getRecentAiIncidents = (): AiIncident[] => readIncidentStore();

export const buildAiIncidentSummary = (incidents: AiIncident[] = []): AiIncidentSummary => {
  const safeIncidents = Array.isArray(incidents) ? incidents : [];
  const now = Date.now();
  const last24h = safeIncidents.filter((item) => {
    const atMs = Date.parse(item?.at || '');
    return Number.isFinite(atMs) && now - atMs <= 24 * 60 * 60 * 1000;
  });

  return {
    totalCount: safeIncidents.length,
    last24hCount: last24h.length,
    criticalCount: last24h.filter((item) => item?.severity === 'critical').length,
    latestIncident: safeIncidents[0] || null,
  };
};

export const getAiIncidentSummary = (): AiIncidentSummary => buildAiIncidentSummary(readIncidentStore());

export const clearAiIncidents = (): void => {
  storageService.removeItem(STORAGE_KEYS.AI_INCIDENTS);
};

export default {
  recordAiIncident,
  getRecentAiIncidents,
  buildAiIncidentSummary,
  getAiIncidentSummary,
  clearAiIncidents,
};
