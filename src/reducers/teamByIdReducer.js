// eslint-disable-next-line no-unused-vars
import { GET_TEAM_BY_ID } from '../constants/team';

// eslint-disable-next-line import/prefer-default-export,default-param-last
export const teamByIdReducer = (team = null, action) => {
  if (action.type === 'GET_TEAM_BY_ID') {
    return action.payload;
  }
  return team;
};
