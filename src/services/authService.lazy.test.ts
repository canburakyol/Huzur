import { beforeEach, describe, expect, it, vi } from 'vitest';

const storageServiceMock = vi.hoisted(() => ({
  getString: vi.fn(() => ''),
  getItemAsync: vi.fn().mockResolvedValue(true),
  setItemAsync: vi.fn().mockResolvedValue(undefined),
  removeItemAsync: vi.fn().mockResolvedValue(undefined),
  removeItem: vi.fn(),
}));

const loggerMock = vi.hoisted(() => ({
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock('./storageService', () => ({
  storageService: storageServiceMock,
}));

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

const importAuthService = async () => import('./authService');

describe('authService lazy initialization', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('does not attach Firebase auth listener just by importing the service', async () => {
    const firebaseAuth = await import('firebase/auth');

    await importAuthService();

    expect(firebaseAuth.onAuthStateChanged).not.toHaveBeenCalled();
  });

  it('attaches the auth listener when onAuthChange is used and cleans up local listener references', async () => {
    const firebaseAuth = await import('firebase/auth');
    const { onAuthChange } = await importAuthService();
    const callback = vi.fn();

    const unsubscribe = onAuthChange(callback);
    await vi.waitFor(() => expect(firebaseAuth.onAuthStateChanged).toHaveBeenCalledTimes(1));
    unsubscribe();

    expect(callback).toHaveBeenCalledWith(null);
  });

  it('lazy-loads signInAnonymously only when authentication is required', async () => {
    const firebaseAuth = await import('firebase/auth');
    const { ensureAuthenticated } = await importAuthService();

    const uid = await ensureAuthenticated();

    expect(uid).toBe('test-user-id');
    expect(firebaseAuth.signInAnonymously).toHaveBeenCalledTimes(1);
  });
});
