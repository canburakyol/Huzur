import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const TimeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTime = () => {
  const context = useContext(TimeContext);
  if (!context) {
    throw new Error('useTime must be used within a TimeProvider');
  }
  return context;
};

export const TimeProvider = ({ children }) => {
  const [timeOfDay, setTimeOfDay] = useState('day'); // morning, noon, afternoon, evening, night
  const [greetingKey, setGreetingKey] = useState('greeting.generic');

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      
      let currentPeriod = 'day';
      let currentGreeting = 'greeting.generic';

      if (hour >= 5 && hour < 12) {
        currentPeriod = 'morning';
        currentGreeting = 'greeting.morning';
      } else if (hour >= 12 && hour < 15) {
        currentPeriod = 'noon';
        currentGreeting = 'greeting.noon';
      } else if (hour >= 15 && hour < 18) {
        currentPeriod = 'afternoon';
        currentGreeting = 'greeting.afternoon';
      } else if (hour >= 18 && hour < 22) {
        currentPeriod = 'evening';
        currentGreeting = 'greeting.evening';
      } else {
        currentPeriod = 'night';
        currentGreeting = 'greeting.night';
      }

      setTimeOfDay(currentPeriod);
      setGreetingKey(currentGreeting);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const value = useMemo(() => ({
    timeOfDay,
    greetingKey
  }), [timeOfDay, greetingKey]);

  return (
    <TimeContext.Provider value={value}>
      {children}
    </TimeContext.Provider>
  );
};
