import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

/**
 * Hook to show toast notifications from any component.
 * @returns {{ showToast: (message: string, type?: 'info'|'success'|'error', duration?: number) => void }}
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful fallback when used outside provider (e.g. in tests)
    return {
      showToast: (message) => {
        console.warn('[Toast] Provider not found, falling back:', message);
      }
    };
  }
  return ctx;
}
