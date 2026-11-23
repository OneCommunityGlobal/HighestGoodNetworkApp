import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = crypto.randomUUID();
    const newToast = { id, message, type, duration };

    setToasts(prev => [...prev, newToast]);

    return id;
  }, []);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback(
    (message, duration) => {
      return addToast(message, 'success', duration);
    },
    [addToast],
  );

  const error = useCallback(
    (message, duration) => {
      return addToast(message, 'error', duration);
    },
    [addToast],
  );

  const info = useCallback(
    (message, duration) => {
      return addToast(message, 'info', duration);
    },
    [addToast],
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
  };
}

export default useToast;
