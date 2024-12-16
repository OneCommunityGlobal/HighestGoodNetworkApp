import httpService from '../services/httpService';
import { ENDPOINTS } from '../utils/URL';
import {
  getOrgData as getOrgDataActionCreator,
  getLeaderBoardData as getLeaderBoardDataActionCreator,
  postLeaderboardData as postLeaderboardDataActionCreator,
} from '../constants/leaderBoardData';

export const getLeaderboardData = userId => {

  return async dispatch => {
    const url = ENDPOINTS.LEADER_BOARD(userId);
    const res = await httpService.get(url);

    await dispatch(getLeaderBoardDataActionCreator(res.data));
  };
};

export const getOrgData = () => {

  return async dispatch => {
    const url = ENDPOINTS.ORG_DATA;
    const res = await httpService.get(url);

    await dispatch(getOrgDataActionCreator(res.data));
  };
};

export const postLeaderboardData = (userId, trophyFollowedUp, userProfile) => {
  
  return async dispatch => {
    try {
      const url = ENDPOINTS.TROPHY_ICON(userId, trophyFollowedUp);
      
      // Attempt to post the data
      const res = await httpService.post(url, userProfile);

      // Dispatch the action with the user profile
      await dispatch(postLeaderboardDataActionCreator(userProfile));
    } catch (error) {
      // Handle any errors that occur
      console.error('Error posting leaderboard data:', error);

    }
  };
};

