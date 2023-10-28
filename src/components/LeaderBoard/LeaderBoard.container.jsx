import { connect } from 'react-redux';
import { get, round } from 'lodash';
import Leaderboard from './Leaderboard';
import { getcolor, getprogress } from '../../utils/effortColors';
import { getMouseoverText } from '../../actions/mouseoverTextAction';

const mapStateToProps = state => {
  const user = get(state, 'userProfile', []);

  const leaderBoardData = get(state, 'leaderBoardData', []);

  const orgData = get(state, 'orgData', {});

  orgData.name = `HGN Totals: ${orgData.memberCount} Members`;
  orgData.tangibletime = round(orgData.totaltangibletime_hrs, 2);
  orgData.totaltime = round(orgData.totaltime_hrs, 2);
  orgData.weeklycommittedHours = round(orgData.totalweeklycommittedHours, 2);

  const tenPTotalOrgTime = orgData.weeklycommittedHours * 0.1;
  const orgTangibleColorTime = orgData.totaltime < tenPTotalOrgTime * 2 ? 0 : 5;

  orgData.barcolor = getcolor(orgTangibleColorTime);
  orgData.barprogress = getprogress(orgTangibleColorTime);

  return {
    leaderBoardData,
    isAuthenticated: get(state, 'auth.isAuthenticated', false),
    loggedInUser: get(state, 'auth.user', {}),
    organizationData: orgData,
    timeEntries: get(state, 'timeEntries', {}),
    isVisible: user.role === 'Volunteer' || user.isVisible,
    roles: get(state, 'role', {}).roles,
    totalTimeMouseoverText: state?.mouseoverText?.[0]?.mouseoverText,
    totalTimeMouseoverTextId: state?.mouseoverText?.[0]?._id,
  };
};
export default connect(mapStateToProps, { getMouseoverText })(Leaderboard);
