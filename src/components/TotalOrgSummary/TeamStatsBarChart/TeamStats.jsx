import TeamStatsBarChart from './TeamStatsBarChart';
import { TEAM_STATS } from 'constants/totalOrgSummary';

function TeamStats() {
  return <TeamStatsBarChart data={TEAM_STATS} xAxisLabel="value" yAxisLabel="name" />;
}

export default TeamStats;
