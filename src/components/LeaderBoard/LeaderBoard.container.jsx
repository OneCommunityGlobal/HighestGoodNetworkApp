import { getLeaderboardData, getOrgData } from '../../actions/leaderBoardData';
import { connect } from 'react-redux';
import Leaderboard from './Leaderboard';
import { getcolor, getprogress, getProgressValue } from '../../utils/effortColors';
import { get, round, maxBy } from 'lodash';

const mapStateToProps = state => {
  let leaderBoardData = get(state, 'leaderBoardData', []);

  console.log(leaderBoardData);

  //filtering users with non zero hours and role different from Mentor
  //created a temp variable so the prev values won't interfere with the new value.
  const nonTutorsData = leaderBoardData.filter(element => {
    if (element.weeklycommittedHours > 0 && element.role !== 'Mentor') {
      return element;
    }
  });
  leaderBoardData = nonTutorsData;

  if (leaderBoardData.length) {
    let maxTotal = maxBy(leaderBoardData, 'totaltime_hrs').totaltime_hrs || 10;

    leaderBoardData = leaderBoardData.map(element => {
      element.didMeetWeeklyCommitment =
        element.totaltangibletime_hrs >= element.weeklycommittedHours ? true : false;

      element.weeklycommitted = round(element.weeklycommittedHours, 2);
      element.tangibletime = round(element.totaltangibletime_hrs, 2);
      element.intangibletime = round(element.totalintangibletime_hrs, 2);

      element.tangibletimewidth = round((element.totaltangibletime_hrs * 100) / maxTotal, 0);

      element.intangibletimewidth = round((element.totalintangibletime_hrs * 100) / maxTotal, 0);

      element.barcolor = getcolor(element.totaltangibletime_hrs);
      element.barprogress = getProgressValue(element.totaltangibletime_hrs, 40);
      element.totaltime = round(element.totaltime_hrs, 2);

      return element;
    });
  }

  const orgData = get(state, 'orgData', {});

  orgData.name = `HGN Totals: ${leaderBoardData.length} Members`;
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
    leaderBoardData: leaderBoardData,
    loggedInUser: get(state, 'auth.user', {}),
    organizationData: orgData,
    timeEntries: get(state, 'timeEntries', {}),
  };
};
export default connect(mapStateToProps, { getLeaderboardData, getOrgData })(Leaderboard);
