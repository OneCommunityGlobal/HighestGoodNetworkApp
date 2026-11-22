// hooks/useProjectsData.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

export function useProjectsData() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = async () => {
    try {
      const response = await axios.get(ENDPOINTS.BM_PROJECTS_WITH_LOCATION);
      const data = response.data.data || [];
      setOrgs(data);
      return data;
    } catch (error) {
      console.error('Error fetching project/org data:', error);
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
