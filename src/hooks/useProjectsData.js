import { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import { MapUtils } from '../components/BMDashboard/InteractiveMap/MapSharedComponents';

export function useProjectsData() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        let data = [];

        try {
          const response = await axios.get(ENDPOINTS.BM_PROJECTS_WITH_LOCATION);
          data = response.data?.data || [];
        } catch (projectError) {
          console.warn('Projects endpoint failed. Trying organization endpoint.', projectError);

          try {
            const response = await axios.get(ENDPOINTS.BM_ORGS_WITH_LOCATION);
            data = response.data?.data || [];
          } catch (orgError) {
            console.error('Both map endpoints failed:', orgError);
          }
        }

        if (Array.isArray(data) && data.length > 0) {
          setOrgs(data);
        } else {
          console.log('Using sample map data.');
          setOrgs(MapUtils.getPseudoOrgs());
        }
      } catch (error) {
        console.error('Error loading map data:', error);
        setOrgs(MapUtils.getPseudoOrgs());
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, []);

  return { orgs, loading, setOrgs };
}
