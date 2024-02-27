import httpService from '../services/httpService';
import { ENDPOINTS } from '../utils/URL';
import {
  getOrgData as getOrgDataActionCreator,
  getLeaderBoardData as getLeaderBoardDataActionCreator,
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
