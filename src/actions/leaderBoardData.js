import httpService from '../services/httpService'
import { ENDPOINTS } from '../utils/URL'
import { getLeaderBoardData as getLeaderBoardDataActionCreator } from '../constants/leaderBoardData'
export const getLeaderboardData = () => {
	//console.log('getLeaderboardData function')

	return async (dispatch, getState) => {
		const { auth } = getState()
		//	console.log('User is ---------------', auth.user.userid)

		const url = ENDPOINTS.LEADER_BOARD(auth.user.userid)
		// console.log(url)
		const res = await httpService.get(url)

		//console.log('LeaderBoardData is ', res.data)

		await dispatch(getLeaderBoardDataActionCreator(res.data))
	}
}
