import { useState, useCallback } from "react";
import errorHandler from "../services/errorHandler";

type HandledError = {
  message: string;
  [key: string]: unknown;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<HandledError | null>(null);

  const handleError = useCallback((err: unknown, context = ""): HandledError => {
    const handledError = errorHandler.handle(err as Parameters<typeof errorHandler.handle>[0], context);
    setError(handledError);

    errorHandler.log(err as Parameters<typeof errorHandler.log>[0], context);

    return handledError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
};

export default useErrorHandler;
