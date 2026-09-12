// eslint-disable-next-line default-param-last
export const teamByIdReducer = (team = null, action) => {
  if (action.type === 'GET_TEAM_BY_ID') {
    return action.payload;
  }
  return team;
};

export default teamByIdReducer;
