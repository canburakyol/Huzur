import { createContext, useContext, useState } from 'react';

const FocusContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};

export const FocusProvider = ({ children }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);

  const toggleFocusMode = () => setIsFocusMode(prev => !prev);
  const enableFocusMode = () => setIsFocusMode(true);
  const disableFocusMode = () => setIsFocusMode(false);

  const value = {
    isFocusMode,
    toggleFocusMode,
    enableFocusMode,
    disableFocusMode
  };

  return (
    <FocusContext.Provider value={value}>
      {children}
    </FocusContext.Provider>
  );
};
