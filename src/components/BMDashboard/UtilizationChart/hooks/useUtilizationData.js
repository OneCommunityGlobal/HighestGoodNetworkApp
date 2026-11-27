import { useState, useCallback, useRef } from 'react';
import axios, { isCancel } from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';

export function useUtilizationData() {
  const [toolsData, setToolsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async (params = {}) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(ENDPOINTS.BM_TOOL_UTILIZATION, {
        params: {
          tool: params.tool,
          project: params.project,
          startDate: params.startDate,
          endDate: params.endDate,
          mode: params.mode,
        },
        headers: { Authorization: localStorage.getItem('token') },
        signal: controller.signal,
      });
      setToolsData(response.data);
    } catch (err) {
      if (isCancel(err)) return;
      const message =
        err.response?.status === 400 && err.response?.data?.error
          ? err.response.data.error
          : 'Failed to load utilization data.';
      setError(message);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  return { toolsData, loading, error, fetchData };
}
