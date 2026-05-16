import { useAppStore } from '../stores/useAppStore';
import { useVisibilityAwareInterval } from '../hooks/useVisibilityAwareInterval';

export const useTime = () => {
  const timeOfDay = useAppStore((s) => s.timeOfDay);
  const greetingKey = useAppStore((s) => s.greetingKey);
  const refreshTimeState = useAppStore((s) => s.refreshTimeState);

  useVisibilityAwareInterval(refreshTimeState, 60000);

  return { timeOfDay, greetingKey };
};

export const TimeProvider = ({ children }) => {
  const refreshTimeState = useAppStore((s) => s.refreshTimeState);
  useVisibilityAwareInterval(refreshTimeState, 60000);
  return children;
};
