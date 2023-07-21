import { getLeaderboardData, getOrgData } from '../../actions/leaderBoardData';
import { connect } from 'react-redux';
import Leaderboard from './Leaderboard';
import { getcolor, getprogress} from '../../utils/effortColors';
import { get, round} from 'lodash';

const mapStateToProps = state => {
  let user = get(state, 'userProfile', []);

  const leaderBoardData = get(state, 'leaderBoardData', []);

  const orgData = get(state, 'orgData', {});

  orgData.name = `HGN Totals: ${orgData.memberCount} Members`;
  orgData.tangibletime = round(orgData.totaltangibletime_hrs, 2);
  orgData.totaltime = round(orgData.totaltime_hrs, 2);
  orgData.intangibletime = round(orgData.totalintangibletime_hrs, 2);
  orgData.weeklycommittedHours = round(orgData.totalweeklycommittedHours, 2);

  const tenPTotalOrgTime = orgData.weeklycommittedHours * 0.1;
  const orgTangibleColorTime = orgData.totaltime < tenPTotalOrgTime * 2 ? 0 : 5;

  orgData.barcolor = getcolor(orgTangibleColorTime);
  orgData.barprogress = getprogress(orgTangibleColorTime);

  return {
    leaderBoardData:leaderBoardData,
    isAuthenticated: get(state, 'auth.isAuthenticated', false),
    loggedInUser: get(state, 'auth.user', {}),
    organizationData: orgData,
    timeEntries: get(state, 'timeEntries', {}),
    isVisible: user.role === 'Volunteer' || user.isVisible,
  };
};
export default connect(mapStateToProps)(Leaderboard);
