import { useState, useCallback } from 'react';
import errorHandler from '../services/errorHandler';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((err, context = '') => {
    const handledError = errorHandler.handle(err, context);
    setError(handledError);
    
    // Log
    errorHandler.log(err, context);

    return handledError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};

export default useErrorHandler;
