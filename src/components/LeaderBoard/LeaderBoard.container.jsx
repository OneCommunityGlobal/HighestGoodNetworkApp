import { connect } from 'react-redux';
import { get, round, maxBy } from 'lodash';
import { getLeaderboardData, getOrgData } from '../../actions/leaderBoardData';
import Leaderboard from './Leaderboard';
import { getcolor, getprogress, getProgressValue } from '../../utils/effortColors';
import { getMouseoverText } from '../../actions/mouseoverTextAction';
import { showTimeOffRequestModal } from '../../actions/timeOffRequestAction';

const mapStateToProps = state => {
  let leaderBoardData = get(state, 'leaderBoardData', []);
  const user = get(state, 'userProfile', []);

  if (user.role !== 'Administrator' && user.role !== 'Owner' && user.role !== 'Core Team') {
    leaderBoardData = leaderBoardData.filter(element => {
      return element.weeklycommittedHours > 0 || user._id === element.personId;
    });
  }

  if (leaderBoardData.length) {
    const maxTotal = maxBy(leaderBoardData, 'totaltime_hrs').totaltime_hrs || 10;

    leaderBoardData = leaderBoardData.map(originalElement => {
      const element = { ...originalElement }; // Create a new object with the same properties

      element.didMeetWeeklyCommitment =
        element.totaltangibletime_hrs >= element.weeklycommittedHours;

      element.weeklycommitted = round(element.weeklycommittedHours, 2);
      element.tangibletime = round(element.totaltangibletime_hrs, 2);
      element.intangibletime = round(element.totalintangibletime_hrs, 2);

      element.tangibletimewidth = round((element.totaltangibletime_hrs * 100) / maxTotal, 0);

      element.intangibletimewidth = round((element.totalintangibletime_hrs * 100) / maxTotal, 0);

      element.barcolor = getcolor(element.totaltangibletime_hrs);
      element.barprogress = getProgressValue(element.totaltangibletime_hrs, 40);
      element.totaltime = round(element.totaltime_hrs, 2);
      element.isVisible = element.role === 'Volunteer' || element.isVisible;

      return element;
    });
  }

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
    isAuthenticated: get(state, 'auth.isAuthenticated', false),
    leaderBoardData,
    loggedInUser: get(state, 'auth.user', {}),
    organizationData: orgData,
    timeEntries: get(state, 'timeEntries', {}),
    isVisible: user.role === 'Volunteer' || user.isVisible,
    roles: get(state, 'role', {}).roles,
    totalTimeMouseoverText: state?.mouseoverText?.[0]?.mouseoverText,
    totalTimeMouseoverTextId: state?.mouseoverText?.[0]?._id,
    userOnTimeOff: state.timeOffRequests?.onTimeOff,
    userGoingOnTimeOff: state.timeOffRequests?.goingOnTimeOff,
    usersOnFutureTimeOff: state.timeOffRequests?.futureTimeOff,
  };
};
export default connect(mapStateToProps, {
  getLeaderboardData,
  getOrgData,
  getMouseoverText,
  showTimeOffRequestModal,
})(Leaderboard);
