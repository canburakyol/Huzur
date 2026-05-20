import reviewedSourceCatalog from '../../shared/reviewedSourceCatalog.json';

export const REVIEWED_SOURCE_STATUS = {
  REVIEWED: 'reviewed',
  CONTEXTUAL: 'contextual',
  GENERAL: 'general_guidance',
  UNREVIEWED: 'unreviewed',
} as const;

export type ReviewedSourceStatus = typeof REVIEWED_SOURCE_STATUS[keyof typeof REVIEWED_SOURCE_STATUS];

interface SourceTemplate {
  type: string;
  reviewStatus: ReviewedSourceStatus;
  confidence: string;
  origin: string;
}

const DEFAULT_SOURCE_TEMPLATE: SourceTemplate = {
  type: 'content',
  reviewStatus: REVIEWED_SOURCE_STATUS.REVIEWED,
  confidence: 'medium',
  origin: 'local_curated',
};

const TYPE_CATALOG = (reviewedSourceCatalog as Record<string, unknown>)?.types || {};
const NAMESPACE_MAP = (reviewedSourceCatalog as Record<string, unknown>)?.namespaces || {};

const normalizeConfidence = (value: string | undefined, fallback = 'medium'): string => (
  ['high', 'medium', 'low'].includes(value ?? '') ? value! : fallback
);

export const getCanonicalSourceTemplate = (type = 'content', namespace = 'content'): SourceTemplate => {
  const resolvedType = (TYPE_CATALOG as Record<string, unknown>)[type]
    ? type
    : ((NAMESPACE_MAP as Record<string, unknown>)[namespace] || 'content');

  return {
    ...DEFAULT_SOURCE_TEMPLATE,
    ...((TYPE_CATALOG as Record<string, Partial<SourceTemplate>>)[resolvedType] || {}),
  };
};

interface SourceMetaInput {
  namespace?: string;
  id?: string;
  label?: string;
  type?: string;
  reviewStatus?: ReviewedSourceStatus;
  confidence?: string;
  origin?: string;
}

interface SourceMeta {
  sourceId: string;
  label: string;
  type: string;
  reviewStatus: ReviewedSourceStatus;
  confidence: string;
  origin: string;
}

export const normalizeReviewedSourceMeta = ({
  namespace = 'content',
  id = 'item',
  label = 'Genel rehberlik',
  type = 'content',
  reviewStatus,
  confidence,
  origin,
}: SourceMetaInput = {}): SourceMeta => {
  const template = getCanonicalSourceTemplate(type, namespace);
  const normalizedNamespace = String(namespace || 'content').trim() || 'content';
  const normalizedId = String(id || 'item').trim() || 'item';

  return {
    sourceId: `${normalizedNamespace}:${normalizedId}`.slice(0, 120),
    label: String(label || 'Genel rehberlik').trim().slice(0, 120),
    type: String(type || template.type || 'content').trim().slice(0, 40),
    reviewStatus: Object.values(REVIEWED_SOURCE_STATUS).includes(reviewStatus as ReviewedSourceStatus)
      ? reviewStatus as ReviewedSourceStatus
      : template.reviewStatus,
    confidence: normalizeConfidence(confidence, template.confidence),
    origin: String(origin || template.origin || 'local_curated').trim().slice(0, 60),
  };
};

export const createReviewedSourceMeta = (value: SourceMetaInput = {}): SourceMeta => normalizeReviewedSourceMeta(value);

export default {
  REVIEWED_SOURCE_STATUS,
  getCanonicalSourceTemplate,
  normalizeReviewedSourceMeta,
  createReviewedSourceMeta,
};
