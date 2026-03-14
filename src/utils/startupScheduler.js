const DEFAULT_IDLE_TIMEOUT_MS = 1500;

const getWindowObject = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window;
};

export const scheduleDeferredTask = (task, delayMs = 0, idleTimeoutMs = DEFAULT_IDLE_TIMEOUT_MS) => {
  const win = getWindowObject();
  if (!win || typeof task !== 'function') {
    return () => {};
  }

  let frameId = null;
  let timeoutId = null;
  let idleId = null;
  let cancelled = false;

  const runTask = () => {
    if (cancelled) {
      return;
    }

    task();
  };

  const queueRun = () => {
    if (cancelled) {
      return;
    }

    if (typeof win.requestIdleCallback === 'function') {
      idleId = win.requestIdleCallback(runTask, { timeout: idleTimeoutMs });
      return;
    }

    timeoutId = win.setTimeout(runTask, 0);
  };

  const afterPaint = () => {
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
