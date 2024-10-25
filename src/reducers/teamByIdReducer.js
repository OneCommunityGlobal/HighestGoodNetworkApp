import { GET_TEAM_BY_ID } from '../constants/team';

// eslint-disable-next-line default-param-last
export default function teamByIdReducer(team = null, action) {
  if (action.type === GET_TEAM_BY_ID) {
    return action.payload;
  }
  return team;
}
