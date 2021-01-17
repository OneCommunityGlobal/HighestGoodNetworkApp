import { getLeaderboardData } from '../../actions/leaderBoardData'
import { connect } from 'react-redux'
import Leaderboard from './Leaderboard'
import {getcolor, getprogress} from '../../utils/effortColors'
import _ from 'lodash'
const mapStateToProps = state => {
	//console.log('State=Leaderboard container', state)
	let leaderBoardData = _.get(state, 'leaderBoardData', [])

	//console.log('Leaderboard Unsorted Data', leaderBoardData)
	let organization = {totaltime: 0, tangibletime: 0, weeklyComittedHours: 0, intangibletime: 0};
	if (leaderBoardData.length) {
		let maxtotal = _.maxBy(leaderBoardData, 'totaltime_hrs').totaltime_hrs
		maxtotal = maxtotal === 0 ? 10 : maxtotal

		leaderBoardData = leaderBoardData.map(element => {
			element.didMeetWeeklyCommitment =
				element.totaltangibletime_hrs >= element.weeklyComittedHours ? true : false

			element.weeklycommited = _.round(element.weeklyComittedHours, 2)
			organization.weeklyComittedHours += element.weeklyComittedHours;
			element.tangibletime = _.round(element.totaltangibletime_hrs, 2);
			element.intangibletime = _.round(element.totalintangibletime_hrs, 2)

			element.tangibletimewidth = _.round(
				(element.totaltangibletime_hrs * 100) / maxtotal,
				0
			)

			element.intangibletimewidth = _.round(
				(element.totalintangibletime_hrs * 100) / maxtotal,
				0
			)

			element.barcolor = getcolor(element.totaltangibletime_hrs)
			element.barprogress = getprogress(element.totaltangibletime_hrs)
			element.totaltime = _.round(element.totaltime_hrs, 2)

			organization.totaltime += _.round(element.totaltime, 2);
			organization.tangibletime += _.round(element.tangibletime, 2);
			organization.intangibletime += _.round(element.intangibletime, 2);
			
			return element
		})
	}

	organization.name = `HGN Totals: ${leaderBoardData.length} Members`
	organization.tangibletime = _.round(organization.tangibletime, 2);
	organization.totaltime += _.round(organization.totaltime, 2);
	organization.intangibletime += _.round(organization.intangibletime, 2);
	//Convert Org Time Color to 10,20,30,40,50,60,70% of totalTime/weeklyCommitted
	let tenPTotalOrgTime = organization.weeklyComittedHours * 0.1;
	let orgTangibleColorTime = (organization.totaltime < (tenPTotalOrgTime * 2)) ? 0 : 5;

	if (orgTangibleColorTime === 5) {
		let multipleRemaining = Math.floor((Math.abs((organization.totaltime - (tenPTotalOrgTime * 2))) / tenPTotalOrgTime));
		orgTangibleColorTime += (multipleRemaining * 10);
	}
	

	organization.barcolor = getcolor(orgTangibleColorTime);
	organization.barprogress = getprogress(orgTangibleColorTime);

	return {
		isAuthenticated: _.get(state, 'auth.isAuthenticated', false),
		leaderBoardData: leaderBoardData,
		loggedInUser: _.get(state, 'auth.user', {}),
		organizationData: organization
	}
}
export default connect(mapStateToProps, { getLeaderboardData })(Leaderboard)
