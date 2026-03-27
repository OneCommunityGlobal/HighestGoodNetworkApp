import { useState, useCallback } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';

export function useUtilizationData() {
  const [toolsData, setToolsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (params = {}) => {
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
      });
      setToolsData(response.data);
    } catch (err) {
      const message =
        err.response?.status === 400 && err.response?.data?.error
          ? err.response.data.error
          : 'Failed to load utilization data.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { toolsData, loading, error, fetchData };
}
