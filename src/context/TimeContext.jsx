import React, { createContext, useContext, useState, useMemo } from 'react';
import { useVisibilityAwareInterval } from '../hooks/useVisibilityAwareInterval';

const TimeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTime = () => {
  const context = useContext(TimeContext);
  if (!context) {
    throw new Error('useTime must be used within a TimeProvider');
  }
  return context;
};

const computeTimeState = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return { period: 'morning', greeting: 'greeting.morning' };
  } else if (hour >= 12 && hour < 15) {
    return { period: 'noon', greeting: 'greeting.noon' };
  } else if (hour >= 15 && hour < 18) {
    return { period: 'afternoon', greeting: 'greeting.afternoon' };
  } else if (hour >= 18 && hour < 22) {
    return { period: 'evening', greeting: 'greeting.evening' };
  }
  return { period: 'night', greeting: 'greeting.night' };
};

export const TimeProvider = ({ children }) => {
  const [timeState, setTimeState] = useState(computeTimeState);

  const updateTime = () => {
    setTimeState(computeTimeState());
  };

  useVisibilityAwareInterval(updateTime, 60000);

  const value = useMemo(() => ({
    timeOfDay: timeState.period,
    greetingKey: timeState.greeting
  }), [timeState]);

  return (
    <TimeContext.Provider value={value}>
      {children}
    </TimeContext.Provider>
  );
};
