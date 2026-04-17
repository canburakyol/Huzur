import { STORAGE_KEYS } from '../constants';
import errorHandler from './errorHandler';
import { storageService } from './storageService';

const MAX_INCIDENTS = 25;
const CRITICAL_STAGES = new Set(['callable_failed', 'response_invalid']);

const sanitizeText = (value, maxLength = 120) => {
  if (typeof value !== 'string') return null;
  return value.trim().slice(0, maxLength) || null;
};

const sanitizeMetadata = (metadata = {}) => {
  if (!metadata || typeof metadata !== 'object') return {};

  const safe = {};
  Object.entries(metadata).forEach(([key, value]) => {
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

const readIncidentStore = () => {
  const stored = storageService.getItem(STORAGE_KEYS.AI_INCIDENTS, []);
  return Array.isArray(stored) ? stored : [];
};

const writeIncidentStore = (incidents) => {
  storageService.setItem(STORAGE_KEYS.AI_INCIDENTS, incidents.slice(0, MAX_INCIDENTS));
};

export const recordAiIncident = (kind, stage, error = null, metadata = {}) => {
  const incident = {
    id: `${kind}_${stage}_${Date.now()}`,
    kind: sanitizeText(kind, 40) || 'unknown',
    stage: sanitizeText(stage, 40) || 'unknown',
    severity: CRITICAL_STAGES.has(stage) ? 'critical' : 'warning',
    code: sanitizeText(error?.code ? String(error.code) : '', 40),
    message: sanitizeText(error?.message || metadata?.reason || 'AI incident', 140),
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

export const getRecentAiIncidents = () => readIncidentStore();

export const buildAiIncidentSummary = (incidents = []) => {
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

export const getAiIncidentSummary = () => buildAiIncidentSummary(readIncidentStore());

export const clearAiIncidents = () => {
  storageService.removeItem(STORAGE_KEYS.AI_INCIDENTS);
};

export default {
  recordAiIncident,
  getRecentAiIncidents,
  buildAiIncidentSummary,
  getAiIncidentSummary,
  clearAiIncidents,
};
