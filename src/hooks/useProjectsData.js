// hooks/useProjectsData.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import { MapUtils } from '../components/BMDashboard/InteractiveMap/MapSharedComponents';

export function useProjectsData() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = async () => {
    try {
      let response;
      try {
        response = await axios.get(ENDPOINTS.BM_PROJECTS_WITH_LOCATION);
      } catch (projectError) {
        response = await axios.get(ENDPOINTS.BM_ORGS_WITH_LOCATION);
      }

      const data = response.data.data || [];

      if (data.length === 0) {
        const pseudoData = MapUtils.getPseudoOrgs();
        setOrgs(pseudoData);
      } else {
        setOrgs(data);
      }
      return data;
    } catch (error) {
      const pseudoData = MapUtils.getPseudoOrgs();
      setOrgs(pseudoData);
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
