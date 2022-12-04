/* eslint-disable arrow-parens */
import httpService from '../services/httpService';
import { ENDPOINTS } from '../utils/URL';
import {
  getOrgData as getOrgDataActionCreator,
  getLeaderBoardData as getLeaderBoardDataActionCreator,
} from '../constants/leaderBoardData';

export const getLeaderBoardData = userId => async dispatch => {
  const url = ENDPOINTS.LEADER_BOARD(userId);
  // console.log(url)
  const res = await httpService.get(url);

  // console.log('LeaderBoardData is ',s res.data)

  await dispatch(getLeaderBoardDataActionCreator(res.data));
};
export const getOrgData = () => async dispatch => {
  const url = ENDPOINTS.ORG_DATA;
  // console.log(url)
  const res = await httpService.get(url);

  // console.log('OrgData is ', res.data)

  await dispatch(getOrgDataActionCreator(res.data));
};
