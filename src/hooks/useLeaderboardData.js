
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import { toast } from 'react-toastify';
import { isEqual } from 'lodash';

function useDeepEffect(effectFunc, deps) {
  const isFirst = useRef(true);
  const prevDeps = useRef(deps);
  useEffect(() => {
    const isSame = prevDeps.current.every((obj, index) => {
      const isItEqual = isEqual(obj, deps[index]);
      return isItEqual;
    });
    if (isFirst.current || !isSame) {
      effectFunc();
    }

    isFirst.current = false;
    prevDeps.current = deps;
  }, deps);
}

const useLeaderboardData = (displayUserId, timeEntries) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [organizationData, setOrganizationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLeaderboardData = async (userId) => {
    try {
      const response = await axios.get(ENDPOINTS.LEADER_BOARD(userId));
      setLeaderboardData(response.data);
    } catch (error) {
      setError(error);
      toast.error('Error fetching leaderboard data');
    }
  };

  const getOrgData = async () => {
    try {
      const response = await axios.get(ENDPOINTS.ORGANIZATION_DATA);
      setOrganizationData(response.data);
    } catch (error) {
      setError(error);
      toast.error('Error fetching organization data');
    }
  };

  useDeepEffect(() => {
    setIsLoading(true);
    Promise.all([getLeaderboardData(displayUserId), getOrgData()])
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [timeEntries, displayUserId]);

  return { leaderboardData, organizationData, isLoading, error, getLeaderboardData, getOrgData };
};

export default useLeaderboardData;
