import { TEAM_STATS } from 'constants/totalOrgSummary';
import TeamStatsBarChart from './TeamStatsBarChart';

function TeamStats() {
  return <TeamStatsBarChart data={TEAM_STATS} xAxisLabel="value" yAxisLabel="name" />;
}

export default TeamStats;
