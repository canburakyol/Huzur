import { beforeEach, describe, expect, it, vi } from 'vitest';

const telemetryMock = vi.hoisted(() => ({
  isTelemetryEnabledSync: vi.fn(() => true),
}));

const loggerMock = vi.hoisted(() => ({
  error: vi.fn(),
  warn: vi.fn(),
}));

vi.mock('./privacyModeService', () => telemetryMock);

vi.mock('../utils/logger', () => ({
  logger: loggerMock,
}));

vi.mock('firebase/app-check', () => ({
  initializeAppCheck: vi.fn(() => ({ appCheck: true })),
  CustomProvider: vi.fn(function CustomProvider(options) {
    return { type: 'custom', options };
  }),
  ReCaptchaEnterpriseProvider: vi.fn(function ReCaptchaEnterpriseProvider(siteKey) {
    return { type: 'enterprise', siteKey };
  }),
  ReCaptchaV3Provider: vi.fn(function ReCaptchaV3Provider(siteKey) {
    return { type: 'v3', siteKey };
  }),
}));

const importFirebaseService = async () => import('./firebase');

describe('firebase lazy getters', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    telemetryMock.isTelemetryEnabledSync.mockReturnValue(true);
  });

  it('does not initialize Firebase app, auth, or firestore just by importing the module', async () => {
    const firebaseApp = await import('firebase/app');
    const firebaseAuth = await import('firebase/auth');
    const firestore = await import('firebase/firestore');

    await importFirebaseService();

    expect(firebaseApp.initializeApp).not.toHaveBeenCalled();
    expect(firebaseAuth.getAuth).not.toHaveBeenCalled();
    expect(firestore.initializeFirestore).not.toHaveBeenCalled();
  });

  it('initializes Firestore only when getDb is called and reuses the cached instance', async () => {
    const firebaseApp = await import('firebase/app');
    const firestore = await import('firebase/firestore');
    const { getDb } = await importFirebaseService();

    const first = await getDb();
    const second = await getDb();

    expect(first).toBe(second);
    expect(firebaseApp.initializeApp).toHaveBeenCalledTimes(1);
    expect(firestore.initializeFirestore).toHaveBeenCalledTimes(1);
  });

  it('initializes Auth only when getAuthInstance is called and reuses the cached instance', async () => {
    const firebaseApp = await import('firebase/app');
    const firebaseAuth = await import('firebase/auth');
    const { getAuthInstance } = await importFirebaseService();

    const first = await getAuthInstance();
    const second = await getAuthInstance();

    expect(first).toBe(second);
    expect(firebaseApp.initializeApp).toHaveBeenCalledTimes(1);
    expect(firebaseAuth.getAuth).toHaveBeenCalledTimes(1);
  });

  it('keeps legacy db and auth exports as explicit async-only guards', async () => {
    const { db, auth } = await importFirebaseService();

    expect(() => Reflect.get(db, 'type')).toThrow('db is async-only');
    expect(() => Reflect.get(auth, 'currentUser')).toThrow('auth is async-only');
  });

  it('does not import analytics when telemetry is disabled', async () => {
    telemetryMock.isTelemetryEnabledSync.mockReturnValue(false);
    const analytics = await import('firebase/analytics');
    const { getAnalyticsInstance } = await importFirebaseService();

    const result = await getAnalyticsInstance();

    expect(result).toEqual({ analytics: null, logEvent: null });
    expect(analytics.getAnalytics).not.toHaveBeenCalled();
  });
});
