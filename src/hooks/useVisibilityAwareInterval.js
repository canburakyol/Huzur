import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { logger } from '../utils/logger';

let isAppInBackground = false;

if (typeof window !== 'undefined') {
  App.addListener('appStateChange', ({ isActive }) => {
    isAppInBackground = !isActive;
    logger.log('[useVisibilityAwareInterval] appStateChange:', isActive ? 'active' : 'background');
  }).catch(() => {});
}

const isHidden = () => document.hidden || isAppInBackground;

export function useVisibilityAwareInterval(callback, delay) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!delay || delay <= 0) return;

    const tick = () => {
      if (!isHidden()) {
        savedCallback.current();
      }
    };

    const id = setInterval(tick, delay);

    const handleVisibilityChange = () => {
      if (!isHidden()) {
        savedCallback.current();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [delay]);
}
