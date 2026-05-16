import { useAppStore } from '../stores/useAppStore';

export const useFocus = () => {
  const isFocusMode = useAppStore((s) => s.isFocusMode);
  const toggleFocusMode = useAppStore((s) => s.toggleFocusMode);
  const enableFocusMode = useAppStore((s) => s.enableFocusMode);
  const disableFocusMode = useAppStore((s) => s.disableFocusMode);

  return {
    isFocusMode,
    toggleFocusMode,
    enableFocusMode,
    disableFocusMode,
  };
};

export const FocusProvider = ({ children }) => children;
