import { getLeaderboardData, getOrgData } from '../../actions/leaderBoardData';
import { connect } from 'react-redux';
import Leaderboard from './Leaderboard';
import { getcolor, getprogress } from '../../utils/effortColors';
import _ from 'lodash';

const mapStateToProps = (state) => {
  let leaderBoardData = _.get(state, 'leaderBoardData', []);

  if (leaderBoardData.length) {
    let maxTotal = _.maxBy(leaderBoardData, 'totaltime_hrs').totaltime_hrs || 10;

    leaderBoardData = leaderBoardData.map((element) => {
      element.didMeetWeeklyCommitment =
        element.totaltangibletime_hrs >= element.weeklyComittedHours ? true : false;

      element.weeklycommited = _.round(element.weeklyComittedHours, 2);
      element.tangibletime = _.round(element.totaltangibletime_hrs, 2);
      element.intangibletime = _.round(element.totalintangibletime_hrs, 2);

      element.tangibletimewidth = _.round((element.totaltangibletime_hrs * 100) / maxTotal, 0);

      element.intangibletimewidth = _.round((element.totalintangibletime_hrs * 100) / maxTotal, 0);

      element.barcolor = getcolor(element.totaltangibletime_hrs);
      element.barprogress = getprogress(element.totaltangibletime_hrs);
      element.totaltime = _.round(element.totaltime_hrs, 2);

      return element;
    });
  }

  const orgData = _.get(state, 'orgData', {});

  orgData.name = `HGN Totals: ${orgData.memberCount} Members`;
  orgData.tangibletime = _.round(orgData.totaltangibletime_hrs, 2);
  orgData.totaltime = _.round(orgData.totaltime_hrs, 2);
  orgData.intangibletime = _.round(orgData.totalintangibletime_hrs, 2);
  orgData.weeklyComittedHours = _.round(orgData.totalWeeklyComittedHours, 2);

  const tenPTotalOrgTime = orgData.weeklyComittedHours * 0.1;
  const orgTangibleColorTime = orgData.totaltime < tenPTotalOrgTime * 2 ? 0 : 5;

  orgData.barcolor = getcolor(orgTangibleColorTime);
  orgData.barprogress = getprogress(orgTangibleColorTime);

  return {
    isAuthenticated: _.get(state, 'auth.isAuthenticated', false),
    leaderBoardData: leaderBoardData,
    loggedInUser: _.get(state, 'auth.user', {}),
    organizationData: orgData,
    timeEntries: _.get(state, 'timeEntries', {}),
  };
};
export default connect(mapStateToProps, { getLeaderboardData, getOrgData })(Leaderboard);
