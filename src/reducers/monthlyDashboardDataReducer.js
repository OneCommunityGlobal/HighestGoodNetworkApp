// eslint-disable-next-line default-param-last
export const monthlyDashboardDataReducer = (monthlyDashboardData = null, action) => {
  if (action.type === 'GET_MONTHLY_DASHBOARD_DATA') {
    return action.payload;
  }

  return monthlyDashboardData;
};

export default monthlyDashboardDataReducer;
