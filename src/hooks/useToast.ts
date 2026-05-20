import { useAppStore } from "../stores/useAppStore";
import { logger } from "../utils/logger";

type ToastType = "info" | "success" | "error" | "warning";

export function useToast() {
  const showToast = useAppStore((s) => s.showToast);
  if (!showToast) {
    return {
      showToast: (message: string) => {
        logger.warn("[Toast] Store not initialized, falling back:", message);
      },
    };
  }
  return { showToast: (message: string, type?: ToastType, duration?: number) => showToast(message, type, duration) };
}
