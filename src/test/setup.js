/**
 * Test Setup File
 * Global test utilities and matchers
 */
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest expect with RTL matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: () => 'web',
    isNativePlatform: () => false,
  },
}));

// Mock Capacitor plugins
vi.mock('@capacitor/push-notifications', () => ({
  PushNotifications: {
    requestPermissions: vi.fn().mockResolvedValue({ receive: 'granted' }),
    register: vi.fn().mockResolvedValue(undefined),
    addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
    removeAllListeners: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    schedule: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn().mockResolvedValue(undefined),
    getPending: vi.fn().mockResolvedValue({ notifications: [] }),
  },
}));

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn().mockReturnValue({ name: '[DEFAULT]' }),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn().mockReturnValue({ currentUser: null }),
  signInAnonymously: vi.fn().mockResolvedValue({ user: { uid: 'test-user-id' } }),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  onAuthStateChanged: vi.fn().mockImplementation((_, cb) => {
    cb(null);
    return vi.fn();
  }),
  signOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('firebase/firestore', () => ({
  initializeFirestore: vi.fn().mockReturnValue({}),
  persistentLocalCache: vi.fn(),
  persistentMultipleTabManager: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({ docs: [] }),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  onSnapshot: vi.fn().mockImplementation((_, cb) => {
    cb({ docs: [], empty: true });
    return vi.fn();
  }),
}));

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn().mockReturnValue({}),
  httpsCallable: vi.fn().mockReturnValue(vi.fn().mockResolvedValue({ data: {} })),
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn().mockReturnValue({}),
  logEvent: vi.fn(),
  setUserId: vi.fn(),
  setUserProperties: vi.fn(),
  isSupported: vi.fn().mockResolvedValue(true),
}));

vi.mock('firebase/app-check', () => ({
  initializeAppCheck: vi.fn(),
  CustomProvider: vi.fn(),
}));

// Mock RevenueCat
vi.mock('@revenuecat/purchases-js', () => ({
  Purchases: {
    configure: vi.fn().mockResolvedValue({}),
    getSharedInstance: vi.fn().mockReturnValue({
      getCustomerInfo: vi.fn().mockResolvedValue({
        entitlements: { active: {} },
      }),
      logIn: vi.fn().mockResolvedValue({ customerInfo: { entitlements: { active: {} } } }),
      logOut: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock navigator.onLine
Object.defineProperty(window.navigator, 'onLine', { value: true, writable: true });

// Mock crypto
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
