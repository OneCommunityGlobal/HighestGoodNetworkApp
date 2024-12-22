import { useState, useEffect } from 'react';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import TeamStatsBarChart from './TeamStatsBarChart';

const activeMembersMinimum = 4;
const endDate = '2023-12-02';

function TeamStats({ usersInTeamStats }) {
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
  }, []);

  if (!usersInTeamStats) {
    return <div>Team stats data is not available</div>;
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

  return (
    <div>
      <TeamStatsBarChart data={data} yAxisLabel="name" />
      {teamsWithActiveMembers && (
        <div className="team-stats-active-members">
          <div className="team-stats-bar-chart-summary">
            <span>
              {teamsWithActiveMembers.count} teams with {activeMembersMinimum}+ active members
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamStats;
