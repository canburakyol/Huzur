const DEFAULT_IDLE_TIMEOUT_MS = 1500;

type BrowserWindow = typeof window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (id: number) => void;
};

const getWindowObject = (): BrowserWindow | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window as BrowserWindow;
};

export const scheduleDeferredTask = (
  task: () => void,
  delayMs = 0,
  idleTimeoutMs = DEFAULT_IDLE_TIMEOUT_MS
): (() => void) => {
  const win = getWindowObject();
  if (!win || typeof task !== 'function') {
    return () => {};
  }

  let frameId: number | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let idleId: number | null = null;
  let cancelled = false;

  const runTask = (): void => {
    if (cancelled) {
      return;
    }

    task();
  };

  const queueRun = (): void => {
    if (cancelled) {
      return;
    }

    if (typeof win.requestIdleCallback === 'function') {
      idleId = win.requestIdleCallback(runTask, { timeout: idleTimeoutMs });
      return;
    }

    timeoutId = win.setTimeout(runTask, 0);
  };

  const afterPaint = (): void => {
    if (cancelled) {
      return;
    }

    if (delayMs > 0) {
      timeoutId = win.setTimeout(queueRun, delayMs);
      return;
    }

    queueRun();
  };

  if (typeof win.requestAnimationFrame === 'function') {
    frameId = win.requestAnimationFrame(afterPaint);
  } else {
    timeoutId = win.setTimeout(afterPaint, 0);
  }

  return () => {
    cancelled = true;

    if (frameId !== null && typeof win.cancelAnimationFrame === 'function') {
      win.cancelAnimationFrame(frameId);
    }

    if (timeoutId !== null) {
      win.clearTimeout(timeoutId);
    }

    if (idleId !== null && typeof win.cancelIdleCallback === 'function') {
      win.cancelIdleCallback(idleId);
    }
  };
};

export default {
  scheduleDeferredTask
};
