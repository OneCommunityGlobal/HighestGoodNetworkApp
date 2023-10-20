// eslint-disable-next-line import/prefer-default-export,default-param-last
export const dashboardDataReducer = (dashboardData = null, action) => {
  if (action.type === 'GET_DASHBOARD_DATA') {
    return action.payload;
  }

  return dashboardData;
};
