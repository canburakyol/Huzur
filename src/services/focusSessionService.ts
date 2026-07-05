import { storageService } from "./storageService";

export type FocusSessionKind = "huzur_mode" | "islamic_meditation";

export interface FocusSession {
  sessionId: string;
  kind: FocusSessionKind;
  presetId: string;
  startedAt: number;
  targetDuration: number;
  deadlineAt: number;
  status: "active" | "paused";
  pausedRemainingMs?: number;
}

interface CompletedFocusSession {
  sessionId: string;
  completedAt: number;
  kind: FocusSessionKind;
}

const ACTIVE_PREFIX = "huzur_focus_active_";
const COMPLETED_PREFIX = "huzur_focus_completed_";
const activeKey = (kind: FocusSessionKind): string => `${ACTIVE_PREFIX}${kind}`;
const completedKey = (sessionId: string): string => `${COMPLETED_PREFIX}${sessionId}`;

const suspendAdsForSession = async (): Promise<void> => {
  try {
    const { adMobService } = await import("./admobService");
    await adMobService.stopAds();
  } catch {
    // Session start must not fail because the ad plugin is unavailable.
  }
};

const createSessionId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
};

export const remainingMs = (session: FocusSession | null, now = Date.now()): number => {
  if (!session) return 0;
  if (session.status === "paused") return Math.max(0, session.pausedRemainingMs || 0);
  return Math.max(0, session.deadlineAt - now);
};

export const startFocusSession = async (kind: FocusSessionKind, presetId: string, targetDuration: number): Promise<FocusSession> => {
  await suspendAdsForSession();
  const startedAt = Date.now();
  const session: FocusSession = {
    sessionId: createSessionId(), kind, presetId, startedAt, targetDuration,
    deadlineAt: startedAt + targetDuration, status: "active",
  };
  if (!await storageService.setPersistentItem(activeKey(kind), session)) throw new Error("Focus session could not be persisted");
  return session;
};

export const getActiveFocusSession = async (kind: FocusSessionKind): Promise<FocusSession | null> => {
  const session = await storageService.getPersistentItem<FocusSession>(activeKey(kind), null);
  if (session) await suspendAdsForSession();
  return session;
};

export const saveFocusSession = async (session: FocusSession): Promise<void> => {
  if (!await storageService.setPersistentItem(activeKey(session.kind), session)) throw new Error("Focus session could not be persisted");
};

export const cancelFocusSession = async (kind: FocusSessionKind): Promise<void> => {
  await storageService.removePersistentItem(activeKey(kind));
};

export const pauseFocusSession = async (session: FocusSession): Promise<FocusSession> => {
  const paused = { ...session, status: "paused" as const, pausedRemainingMs: remainingMs(session) };
  await saveFocusSession(paused);
  return paused;
};

export const resumeFocusSession = async (session: FocusSession): Promise<FocusSession> => {
  const resumed = { ...session, status: "active" as const, deadlineAt: Date.now() + Math.max(0, session.pausedRemainingMs || 0), pausedRemainingMs: undefined };
  await saveFocusSession(resumed);
  return resumed;
};

// Idempotency boundary: one durable completion record per session id.
export const completeFocusSession = async (session: FocusSession): Promise<boolean> => {
  const key = completedKey(session.sessionId);
  if (await storageService.hasPersistentKey(key)) {
    await storageService.removePersistentItem(activeKey(session.kind));
    return false;
  }
  const completion: CompletedFocusSession = { sessionId: session.sessionId, completedAt: Date.now(), kind: session.kind };
  if (!await storageService.setPersistentItem(key, completion)) throw new Error("Focus completion could not be persisted");
  await storageService.removePersistentItem(activeKey(session.kind));
  return true;
};
