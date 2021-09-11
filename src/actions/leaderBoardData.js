import httpService from '../services/httpService'
import { ENDPOINTS } from '../utils/URL'
import { getOrgData as getOrgDataActionCreator, getLeaderBoardData as getLeaderBoardDataActionCreator } from '../constants/leaderBoardData'

export const getLeaderboardData = userId => {
	//console.log('getLeaderboardData function')

	return async dispatch => {
		const url = ENDPOINTS.LEADER_BOARD(userId)
		const res = await httpService.get(url)


		await dispatch(getLeaderBoardDataActionCreator(res.data))
	}
}

export const getOrgData = () => {
	//console.log('getLeaderboardData function')

	return async dispatch => {
		const url = ENDPOINTS.ORG_DATA
		//console.log(url)
		const res = await httpService.get(url)

		//console.log('OrgData is ', res.data)

		await dispatch(getOrgDataActionCreator(res.data))
	}
}
