import httpService from '../services/httpService';
import { ENDPOINTS } from '../utils/URL';
import {
  getOrgData as getOrgDataActionCreator,
  getLeaderBoardData as getLeaderBoardDataActionCreator,
  postLeaderboardData as postLeaderboardDataAcrionCreator,
} from '../constants/leaderBoardData';

export const getLeaderboardData = userId => {

  return async dispatch => {
    const url = ENDPOINTS.LEADER_BOARD(userId);
    const res = await httpService.get(url);

    await dispatch(getLeaderBoardDataActionCreator(res.data));
  };
};

export const postLeaderboardData = (userId, trophyFollowedUp, userProfile) => {
  return async dispatch => {
    const url = ENDPOINTS.TROPHY_ICON(userId, trophyFollowedUp);
    const res = await httpService.post(url, userProfile);

    await dispatch(postLeaderboardDataAcrionCreator(userProfile));
  };
}

export const getOrgData = () => {

  return async dispatch => {
    const url = ENDPOINTS.ORG_DATA;
    const res = await httpService.get(url);

    await dispatch(getOrgDataActionCreator(res.data));
  };
};
