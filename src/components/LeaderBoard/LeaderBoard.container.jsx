import { getLeaderboardData } from '../../actions/leaderBoardData'
import { connect } from 'react-redux'
import Leaderboard from './Leaderboard'
import getcolor from '../../utils/effortColors'
import _ from 'lodash'
const mapStateToProps = state => {
	//console.log('State=Leaderboard container', state)

	let leaderBoardData = _.get(state, 'leaderBoardData', [])

	//console.log('Leaderboard Unsorted Data', leaderBoardData)

	if (leaderBoardData.length) {
		let maxtotal = _.maxBy(leaderBoardData, 'totaltime_hrs').totaltime_hrs
		maxtotal = maxtotal === 0 ? 10 : maxtotal

		leaderBoardData = leaderBoardData.map(element => {
			element.didMeetWeeklyCommitment =
				element.totaltangibletime_hrs >= element.weeklyComittedHours ? true : false

			element.weeklycommited = _.round(element.weeklyComittedHours, 2)

			element.tangibletime = _.round(element.totaltangibletime_hrs, 2)
			element.intangibletime = _.round(element.totalintangibletime_hrs, 2)
			element.tangibletimewidth = _.round(
				(element.totaltangibletime_hrs * 100) / maxtotal,
				0
			)
			element.intangibletimewidth = _.round(
				(element.totalintangibletime_hrs * 100) / maxtotal,
				0
			)
			element.tangiblebarcolor = getcolor(element.totaltangibletime_hrs)
			element.totaltime = _.round(element.totaltime_hrs, 2)
			return element
		})
	}

	//console.log(leaderBoardData)

	return {
		isAuthenticated: _.get(state, 'auth.isAuthenticated', false),
		leaderBoardData: leaderBoardData,
		loggedInUser: _.get(state, 'auth.user', {})
	}
}
export default connect(mapStateToProps, { getLeaderboardData })(Leaderboard)
