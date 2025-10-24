import { useState, useEffect } from 'react';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import Loading from 'components/common/Loading';
import TeamStatsBarChart from './TeamStatsBarChart';
import './TeamStats.css';

const activeMembersMinimumDropDownOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30];

function TeamStats({ isLoading, usersInTeamStats, endDate }) {
  const [activeMembersMinimum, setActiveMembersMinimum] = useState(
    activeMembersMinimumDropDownOptions[0],
  );
  const [teamsWithActiveMembers, setTeamsWithActiveMembers] = useState(null);
  const [teamsStatsFetchingError, setTeamsStatsFetchingError] = useState(null);

  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        const url = ENDPOINTS.VOLUNTEER_ROLES_TEAM_STATS(endDate, activeMembersMinimum);
        // NEED TO ABSTRACT THIS TO ITS OWN REDUX REDUCER
        const response = await axios.get(url);
        const { data } = response;
        setTeamsWithActiveMembers(data.teamsWithActiveMembers);
      } catch (error) {
        setTeamsStatsFetchingError(error);
      }
    };
    fetchTeamsData();
  }, [activeMembersMinimum]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="w-100vh">
          <Loading />
        </div>
      </div>
    );
  }

  if (teamsStatsFetchingError) {
    return <div>Cannot be fetched as of now.</div>;
  }

  const { inTeam, notInTeam } = usersInTeamStats;

  const data = [
    {
      name: 'Not In Team',
      value: notInTeam.count,
      change: +notInTeam.comparisonPercentage || 0,
      color: '#36A2EB',
    },
    {
      name: 'In Team',
      value: inTeam.count,
      change: +inTeam.comparisonPercentage || 0,
      color: '#1B6DDF',
    },
  ];

  function handleActiveMembersMinimumChange(event) {
    const selectedActiveMembersMinimum = event.target.value;
    if (!selectedActiveMembersMinimum) return;
    setActiveMembersMinimum(selectedActiveMembersMinimum);
  }

  return (
    <div>
      <TeamStatsBarChart data={data} yAxisLabel="name" />
      {teamsWithActiveMembers && (
        <div className="team-stats-active-members">
          <div className="team-stats-bar-chart-summary">
            <span>
              {`${teamsWithActiveMembers.count} ${
                teamsWithActiveMembers.count === 1 ? 'team' : 'teams'
              } with`}
              <select
                onChange={handleActiveMembersMinimumChange}
                value={activeMembersMinimum}
                className="team-stats-active-members-dropdown"
              >
                {activeMembersMinimumDropDownOptions.map(activeMembersMinimumOption => (
                  <option
                    key={`${activeMembersMinimumOption}-dropdown`}
                    value={activeMembersMinimumOption}
                  >
                    {activeMembersMinimumOption}
                  </option>
                ))}
              </select>
              + active members
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamStats;
