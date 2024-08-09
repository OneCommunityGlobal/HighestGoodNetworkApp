import { TEAM_STATS, TEAM_STATS_OVERALL_STATS } from 'constants/totalOrgSummary';
import TeamStatsBarChart from './TeamStatsBarChart';

function TeamStats() {
  return (
    <TeamStatsBarChart
      data={TEAM_STATS}
      yAxisLabel="name"
      overallTeamStats={TEAM_STATS_OVERALL_STATS}
    />
  );
}

export default TeamStats;
