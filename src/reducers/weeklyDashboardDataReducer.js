// Adjusted parameter order
export default function weeklyDashboardDataReducer(
  action,
  weeklyDashboardData = null
) {
  if (action.type === 'GET_WEEKLY_DASHBOARD_DATA') {
    return action.payload;
  }

  return weeklyDashboardData;
}
