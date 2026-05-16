import { useAppStore } from '../stores/useAppStore';
import { logger } from '../utils/logger';

/**
 * Hook to show toast notifications from any component.
 * @returns {{ showToast: (message: string, type?: 'info'|'success'|'error', duration?: number) => void }}
 */
export function useToast() {
  const showToast = useAppStore((s) => s.showToast);
  if (!showToast) {
    return {
      showToast: (message) => {
        logger.warn('[Toast] Store not initialized, falling back:', message);
      }
    };
  }
  return { showToast };
}
