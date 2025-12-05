import { useState, useCallback } from 'react';

/**
 * Custom hook to handle resource fetching with consistent error handling
 * Reduces code duplication across ResourceRequest components
 */
export const useResourceFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWithErrorHandling = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...(options.body && { body: JSON.stringify(options.body) }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error(
            'Backend endpoint not found. Please ensure the API server is running and the endpoint is configured.',
          );
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        const contentType = response.headers.get('content-type') || 'unknown format';
        throw new Error(
          `Invalid response format from server. Expected JSON but received: ${contentType}`,
        );
      }

      setLoading(false);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  return { loading, error, setLoading, setError, fetchWithErrorHandling };
};

export default useResourceFetch;
