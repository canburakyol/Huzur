import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const appMock = vi.hoisted(() => {
  const listeners: Array<{ cb: () => void; removed: boolean }> = [];
  return {
    listeners,
    exitApp: vi.fn(),
    addListener: vi.fn(async (_event: string, cb: () => void) => {
      const entry = { cb, removed: false };
      listeners.push(entry);
      return { remove: () => { entry.removed = true; } };
    }),
  };
});

vi.mock('@capacitor/app', () => ({ App: { addListener: appMock.addListener, exitApp: appMock.exitApp } }));

import { useBackButton } from './useBackButton';

const pressBack = () => appMock.listeners.filter((l) => !l.removed).forEach((l) => l.cb());

const baseProps = () => ({
  showMoodSelector: false,
  showHamburgerMenu: false,
  activeFeature: null as string | null,
  activeTab: 'home',
  setShowMoodSelector: vi.fn(),
  setShowHamburgerMenu: vi.fn(),
  setActiveFeature: vi.fn(),
  setActiveTab: vi.fn(),
});

describe('useBackButton', () => {
  beforeEach(() => {
    appMock.listeners.length = 0;
    vi.clearAllMocks();
  });

  it('closes the open hamburger menu instead of exiting the app', async () => {
    const props = { ...baseProps(), showHamburgerMenu: true };
    renderHook(() => useBackButton(props));
    await waitFor(() => expect(appMock.listeners.length).toBe(1));

    pressBack();

    expect(props.setShowHamburgerMenu).toHaveBeenCalledWith(false);
    expect(appMock.exitApp).not.toHaveBeenCalled();
  });

  it('keeps exactly one live listener after rapid re-renders', async () => {
    const { rerender } = renderHook((p) => useBackButton(p), { initialProps: baseProps() });
    rerender({ ...baseProps(), activeTab: 'quran' });
    rerender({ ...baseProps(), activeTab: 'prayers' });
    await waitFor(() => expect(appMock.listeners.length).toBe(3));

    expect(appMock.listeners.filter((l) => !l.removed)).toHaveLength(1);
  });
});
