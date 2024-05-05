import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { ENDPOINTS } from '../../../utils/URL';
import TeamWeeklySummaries from '../TeamWeeklySummaries/TeamWeeklySummaries_v2';

const TeamSummarySelect = React.memo(({
  userId, shouldRefreshData, darkMode, customStyles,
}) => {
  const [userSelected, setUserSelected] = useState('');
  const [userWeeklySummaries, setUserWeeklySummaries] = useState(null);

  const [teammateList, setTeammateList] = useState([]);
  // const [weeklySummary, setWeeklySummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  /* Data Fetching */
  // Get Teammate List
  const getTeammateList = useCallback(async () => {
    if (!userId) return;
    setFetchError(false);
    setLoading(true);
    try {
      // Fetch teammate list
      const response = await axios.get(ENDPOINTS.TEAMMATE_FOR_USER(userId));
      const teammateData = response.data;
      let transformedTeammateList = [];
      if (teammateData) {
        transformedTeammateList = teammateData.map((teammate) => ({
          value: [teammate.name, teammate.personId],
          label: `View ${teammate.name}'s summary.`,
        }));
      }
      // Set teammate list
      setTeammateList(transformedTeammateList);
    } catch (error) {
      setFetchError(true);
      toast.error('Failed to fetch teammate list');
    } finally {
      setLoading(false);
    }
  }, userId);

  // Get Weekly Summary for selected teammate
  const getWeeklySummaryForSelectedUser = async (selectedUserId) => {
    try {
      setFetchError(false);
      const response = await axios.get(ENDPOINTS.USER_WEEKLY_SUMMARRIES(selectedUserId));
      const user = response.data;
      const userSummaries = user.weeklySummaries;

      setUserWeeklySummaries(userSummaries);
    } catch (err) {
      setFetchError(true);
      toast.error('Failed to fetch user weekly summaries');
    } finally {
      setLoading(false);
    }
  };

  const handleSummaryOnchange = (e) => {
    const fullname = e.value[0];
    const selectedUserId = e.value[1];
    setUserSelected(fullname);
    getWeeklySummaryForSelectedUser(selectedUserId);
  };

  useEffect(() => {
    getTeammateList();
  }, [userId]);

  // Fetch data if shouldRefreshData is true.
  // This is to handle the case when the user profile changes.
  useEffect(() => {
    if (shouldRefreshData) {
      getTeammateList();
    }
  }, [shouldRefreshData]);

  return (
    // eslint-disable-next-line no-nested-ternary
    (loading ? (<div>Loading...</div>) : fetchError
      ? (
        <div>Failed to fetch data
          <button type="button" onClick={getTeammateList}>Retry</button>
        </div>
      )
      : (
        <div>
        <div>
          <Select
            className={darkMode}
            options={teammateList}
            styles={customStyles}
            onChange={handleSummaryOnchange}
          />
        </div >
          {userSelected && userWeeklySummaries && teammateList.length > 0
            && userWeeklySummaries.map((data, i) => (
              <TeamWeeklySummaries
                key={data._id}
                i={i}
                name={userSelected}
                data={data}
                darkMode={darkMode} />
            ))}
          </div>
      )
    )
  );
});

export default TeamSummarySelect;
