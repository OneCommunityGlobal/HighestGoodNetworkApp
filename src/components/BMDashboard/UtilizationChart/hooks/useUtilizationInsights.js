import { useState, useCallback, useRef } from 'react';
import axios, { isCancel } from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';

const INITIAL_INSIGHTS = {
  recommendations: [],
  maintenanceAlerts: [],
  resourceBalancing: [],
  summary: null,
};

export function useUtilizationInsights() {
  const [insights, setInsights] = useState(INITIAL_INSIGHTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchInsights = useCallback(async (params = {}) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(ENDPOINTS.BM_TOOL_UTILIZATION_INSIGHTS, {
        params: {
          tool: params.tool,
          project: params.project,
          startDate: params.startDate,
          endDate: params.endDate,
        },
        headers: { Authorization: localStorage.getItem('token') },
        signal: controller.signal,
      });
      setInsights(response.data);
    } catch (err) {
      if (isCancel(err)) return;
      const message =
        err.response?.status === 400 && err.response?.data?.error
          ? err.response.data.error
          : 'Failed to load insights data.';
      setError(message);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  return { insights, loading, error, fetchInsights };
}
