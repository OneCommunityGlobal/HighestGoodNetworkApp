// eslint-disable-next-line import/prefer-default-export,default-param-last
export const weeklyDashboardDataReducer = (weeklyDashboardData = null, action) => {
  if (action.type === 'GET_WEEKLY_DASHBOARD_DATA') {
    return action.payload;
  }

  return weeklyDashboardData;
};
