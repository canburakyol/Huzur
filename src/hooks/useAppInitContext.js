import { useContext } from 'react';
import { AppInitContext } from '../context/appInitContext';

export const useAppInitContext = () => {
  const context = useContext(AppInitContext);
  if (!context) {
    throw new Error('useAppInitContext must be used within an AppInitProvider');
  }
  return context;
};
