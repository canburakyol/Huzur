import type { User, Unsubscribe } from "firebase/auth";
import { getAuthInstance } from "./firebase";
import { storageService } from "./storageService";
import { logger } from "../utils/logger";

let currentUser: User | null = null;
let authListeners: Array<(user: User | null) => void> = [];
let authInitialized = false;
let authListenerStarted = false;
let authUnsubscribe: Unsubscribe | null = null;
let authPromiseResolve: ((user: User | null) => void) | null = null;

const authReadyPromise: Promise<User | null> = new Promise((resolve) => {
  authPromiseResolve = resolve;
});

const resolveAuthReady = (user: User | null): void => {
  if (authPromiseResolve) {
    authPromiseResolve(user);
    authPromiseResolve = null;
  }
};

const handleAuthState = (user: User | null): void => {
  currentUser = user;
  authInitialized = true;

  if (user) {
    logger.log("[AuthService] User authenticated");
    const oldLocalId = storageService.getString("hatim_user_id", "");
    storageService.getItemAsync("auth_migrated").then((migrated) => {
      if (oldLocalId && !migrated) {
        storageService.setItemAsync("old_local_user_id", oldLocalId);
        logger.log("[AuthService] Old local ID saved for migration (secure)");
      }
    });
  } else {
    logger.log("[AuthService] No user, will sign in anonymously");
  }

  resolveAuthReady(user);
  authListeners.forEach((listener) => listener(user));
};

const initAuthListener = async (): Promise<void> => {
  if (authListenerStarted) {
    return;
  }

  authListenerStarted = true;

  try {
    const [{ onAuthStateChanged }, auth] = await Promise.all([
      import("firebase/auth"),
      getAuthInstance(),
    ]);
    authUnsubscribe = onAuthStateChanged(auth, handleAuthState);
  } catch (error) {
    authInitialized = true;
    logger.error("[AuthService] Auth listener initialization failed:", error);
    resolveAuthReady(null);
  }
};

export const ensureAuthenticated = async (): Promise<string | null> => {
  try {
    if (currentUser) {
      return currentUser.uid;
    }

    if (!authInitialized) {
      void initAuthListener();
      await authReadyPromise;
      if (currentUser) {
        return currentUser.uid;
      }
    }

    logger.log("[AuthService] Signing in anonymously...");
    const [{ signInAnonymously }, auth] = await Promise.all([
      import("firebase/auth"),
      getAuthInstance(),
    ]);
    const userCredential = await signInAnonymously(auth);
    currentUser = userCredential.user;

    logger.log("[AuthService] Signed in anonymously");

    await storageService.setItemAsync("auth_migrated", true);

    return currentUser.uid;
  } catch (error) {
    logger.error("[AuthService] Anonymous sign in error:", error);

    if ((error as { code?: string }).code === "auth/network-request-failed") {
      logger.warn("[AuthService] Network error, using fallback");
    }

    return null;
  }
};

export const getCurrentUserId = (): string | null => {
  return currentUser?.uid || null;
};

export const getCurrentUserIdEnsured = async (): Promise<string | null> => {
  if (currentUser?.uid) return currentUser.uid;
  return ensureAuthenticated();
};

export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
  authListeners.push(callback);
  void initAuthListener();

  if (authInitialized) {
    callback(currentUser);
  }

  return () => {
    authListeners = authListeners.filter((l) => l !== callback);
  };
};

export const waitForAuth = async (): Promise<User | null> => {
  if (authInitialized) {
    return currentUser;
  }
  void initAuthListener();
  return authReadyPromise;
};

export const getOldLocalUserId = async (): Promise<string | null> => {
  const secureId = await storageService.getItemAsync<string>("old_local_user_id");
  return secureId || storageService.getString("hatim_user_id", "");
};

export const clearMigrationData = async (): Promise<void> => {
  await storageService.removeItemAsync("old_local_user_id");
  storageService.removeItem("hatim_user_id");
  logger.log("[AuthService] Migration data cleared");
};

export default {
  ensureAuthenticated,
  getCurrentUserId,
  getCurrentUserIdEnsured,
  onAuthChange,
  waitForAuth,
  getOldLocalUserId,
  clearMigrationData,
};
