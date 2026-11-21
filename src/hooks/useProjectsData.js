// hooks/useProjectsData.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

export function useProjectsData() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = async () => {
    try {
      // Project locations come from the orgs endpoint. The backend has no
      // /bm/projects/location route (projects have no coordinates), so calling
      // it first only produced a 404 in the console on every load.
      const response = await axios.get(ENDPOINTS.BM_ORGS_WITH_LOCATION);
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setOrgs(data);
      return data;
    } catch (error) {
      console.error('Error fetching project/org data:', error);
      // Show an accurate empty map instead of sample projects when loading fails.
      setOrgs([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  return { orgs, loading, setOrgs };
}
