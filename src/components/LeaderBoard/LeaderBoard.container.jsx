import { getLeaderboardData, getOrgData } from '../../actions/leaderBoardData';
import { connect } from 'react-redux';
import Leaderboard from './Leaderboard';
import { getcolor, getprogress, getProgressValue } from '../../utils/effortColors';
import { get, round, maxBy } from 'lodash';

const mapStateToProps = state => {
  let leaderBoardData = get(state, 'leaderBoardData', []);
  let user = get(state, 'userProfile', []);

  //created an auxiliar variable so the filtering do not interfere with the main variable
  let nonTutorsData = [];

  //filtering users with non zero hours and role different from Mentor
  if (user.role === 'Administrator' || user.role === 'Owner' || user.role === 'Core Team') {
    //nothing happens if the user is an administrator, owner or core team, they are able to see all the leaderboard, including members with zero hours and mentor members
    leaderBoardData = leaderBoardData
  } else if (
    //if the user is not an administrator, nor owner, nor mentor, and also not a core team, it will only see the people from the same team, no zero hour members and not mentor members
    user.role !== 'Administrator' &&
    user.role !== 'Owner' &&
    user.role !== 'Mentor' &&
    user.role !== 'Core Team' &&
    user.weeklycommittedHours > 0
  ) {
    nonTutorsData = leaderBoardData.filter(element => {
      if (element.weeklycommittedHours > 0 && element.role[0] !== 'Mentor') {
        return element;
      }
    });
    leaderBoardData = nonTutorsData;
  } else if (user.role === 'Mentor' || user.weeklycommittedHours === 0) { //if the user is a mentor, or have zero hours, it will be able to see itself and the members from it's team
    nonTutorsData = leaderBoardData.filter(element => {
      if (
        (element.weeklycommittedHours > 0 && element.role[0] !== 'Mentor') ||
        user._id === element.personId
      ) {
        return element;
      }
    });
    leaderBoardData = nonTutorsData;
  }

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
    leaderBoardData: leaderBoardData,
    loggedInUser: get(state, 'auth.user', {}),
    organizationData: orgData,
    timeEntries: get(state, 'timeEntries', {}),
  };
};
export default connect(mapStateToProps, { getLeaderboardData, getOrgData })(Leaderboard);
