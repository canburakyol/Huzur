import reviewedSourceCatalog from '../../shared/reviewedSourceCatalog.json';

export const REVIEWED_SOURCE_STATUS = {
  REVIEWED: 'reviewed',
  CONTEXTUAL: 'contextual',
  GENERAL: 'general_guidance',
  UNREVIEWED: 'unreviewed',
};

const DEFAULT_SOURCE_TEMPLATE = {
  type: 'content',
  reviewStatus: REVIEWED_SOURCE_STATUS.REVIEWED,
  confidence: 'medium',
  origin: 'local_curated',
};

const TYPE_CATALOG = reviewedSourceCatalog?.types || {};
const NAMESPACE_MAP = reviewedSourceCatalog?.namespaces || {};

const normalizeConfidence = (value, fallback = 'medium') => (
  ['high', 'medium', 'low'].includes(value) ? value : fallback
);

export const getCanonicalSourceTemplate = (type = 'content', namespace = 'content') => {
  const resolvedType = TYPE_CATALOG[type]
    ? type
    : (NAMESPACE_MAP[namespace] || 'content');

  return {
    ...DEFAULT_SOURCE_TEMPLATE,
    ...(TYPE_CATALOG[resolvedType] || {}),
  };
};

export const normalizeReviewedSourceMeta = ({
  namespace = 'content',
  id = 'item',
  label = 'Genel rehberlik',
  type = 'content',
  reviewStatus,
  confidence,
  origin,
} = {}) => {
  const template = getCanonicalSourceTemplate(type, namespace);
  const normalizedNamespace = String(namespace || 'content').trim() || 'content';
  const normalizedId = String(id || 'item').trim() || 'item';

  return {
    sourceId: `${normalizedNamespace}:${normalizedId}`.slice(0, 120),
    label: String(label || 'Genel rehberlik').trim().slice(0, 120),
    type: String(type || template.type || 'content').trim().slice(0, 40),
    reviewStatus: Object.values(REVIEWED_SOURCE_STATUS).includes(reviewStatus)
      ? reviewStatus
      : template.reviewStatus,
    confidence: normalizeConfidence(confidence, template.confidence),
    origin: String(origin || template.origin || 'local_curated').trim().slice(0, 60),
  };
};

export const createReviewedSourceMeta = (value = {}) => normalizeReviewedSourceMeta(value);

export default {
  REVIEWED_SOURCE_STATUS,
  getCanonicalSourceTemplate,
  normalizeReviewedSourceMeta,
  createReviewedSourceMeta,
};
