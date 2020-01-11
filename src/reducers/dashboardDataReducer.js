export const dashboardDataReducer = (dashboardData = null, action) => {
  if (action.type === 'GET_DASHBOARD_DATA') {
    return action.payload;
  }

  return dashboardData;
};
