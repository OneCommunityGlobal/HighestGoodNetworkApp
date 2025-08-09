import { useState, useEffect } from 'react';
import axios from 'axios';

import { ENDPOINTS } from '~/utils/URL'; // adjust path

/**
 * Custom hook to search users by query string with debounce.
 * @param {string} query - The search query.
 * @param {number} delay - Debounce delay in ms (default: 350)
 * @returns {{ users: Array<Object>, loading: boolean, error: Error|null }}
 */
export function useUserSearch(query, delay = 350) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(handler);
  }, [query, delay]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setUsers([]);
      return;
    }

    let isCancelled = false;

    async function search() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${ENDPOINTS.SEARCH_USER}?name=${debouncedQuery}`);
        if (!isCancelled) {
          setUsers(res.data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    search();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  return { users, loading, error };
}
