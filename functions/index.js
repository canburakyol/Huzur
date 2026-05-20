const runtime = require('./common/runtime');
const ai = require('./ai');
const analytics = require('./analytics');
const auth = require('./auth');
const hatim = require('./hatim');
const referral = require('./referral');
const social = require('./social');
const webhook = require('./webhook');

const { __test: aiTest = {}, ...aiExports } = ai;
const { __test: authTest = {}, ...authExports } = auth;
const { __test: hatimTest = {}, ...hatimExports } = hatim;
const { __test: referralTest = {}, ...referralExports } = referral;
const { __test: socialTest = {}, ...socialExports } = social;

module.exports = {
  ...webhook,
  ...authExports,
  ...socialExports,
  ...hatimExports,
  ...aiExports,
  ...referralExports,
  ...analytics,
  __test: {
    createCreateDuaHandler: socialTest.createCreateDuaHandler,
    createListRecentDuasHandler: socialTest.createListRecentDuasHandler,
    createCreateGroupHatimHandler: hatimTest.createCreateGroupHatimHandler,
    createAskAssistantV2Handler: aiTest.createAskAssistantV2Handler,
    createJoinFamilyByInviteCodeHandler: socialTest.createJoinFamilyByInviteCodeHandler,
    createJoinHatimByCodeHandler: hatimTest.createJoinHatimByCodeHandler,
    createGenerateWeeklyInsightsV1Handler: aiTest.createGenerateWeeklyInsightsV1Handler,
    createSyncFcmTokenHandler: authTest.createSyncFcmTokenHandler,
    readCombinedProStatus: authTest.readCombinedProStatus,
    resolveRevenueCatProEntitlement: authTest.resolveRevenueCatProEntitlement,
    resolveActiveStatus: authTest.resolveActiveStatus,
    createPrayForDuaHandler: socialTest.createPrayForDuaHandler,
    createSyncReferralStateHandler: referralTest.createSyncReferralStateHandler,
    createGetReferralServerSnapshotHandler: referralTest.createGetReferralServerSnapshotHandler,
    createUpdateHatimPartHandler: hatimTest.createUpdateHatimPartHandler,
    createContributeToFamilyWeeklyGoalHandler: socialTest.createContributeToFamilyWeeklyGoalHandler,
    createUpdateMiniLeaguePreferencesHandler: socialTest.createUpdateMiniLeaguePreferencesHandler,
    checkDistributedRateLimit: runtime.checkDistributedRateLimit,
    buildAssistantFallbackResponseV2: runtime.buildAssistantFallbackResponseV2,
    buildAssistantSafetyResponse: runtime.buildAssistantSafetyResponse,
    buildAiHealthSnapshot: aiTest.buildAiHealthSnapshot,
    buildAiReleaseStatusFromMetrics: runtime.buildAiReleaseStatusFromMetrics,
    buildHomeRankingFallback: runtime.buildHomeRankingFallback,
    buildPushHintFallback: runtime.buildPushHintFallback,
    buildContextSources: runtime.buildContextSources,
    calculateTrustScore: runtime.calculateTrustScore,
    deriveReviewStatus: runtime.deriveReviewStatus,
    getCanonicalSourceTemplate: runtime.getCanonicalSourceTemplate,
    getIstanbulDateKey: runtime.getIstanbulDateKey,
    buildReferralServerSnapshot: referralTest.buildReferralServerSnapshot,
    normalizeCode: runtime.normalizeCode,
    normalizeAssistantResponse: aiTest.normalizeAssistantResponse,
    normalizeCanonicalSourceMeta: runtime.normalizeCanonicalSourceMeta,
    normalizeFcmToken: runtime.normalizeFcmToken,
    normalizeHomeRankingResponse: aiTest.normalizeHomeRankingResponse,
    normalizePushHintResponse: aiTest.normalizePushHintResponse,
    normalizeWeeklyInsightResponse: aiTest.normalizeWeeklyInsightResponse,
    recordAiOpsMetric: runtime.recordAiOpsMetric,
  },
};
