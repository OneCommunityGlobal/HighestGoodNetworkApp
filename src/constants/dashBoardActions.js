export const DASHBOARD_DATA = 'DASHBOARD_DATA';

export const getDashboardData = data => ({
  type: DASHBOARD_DATA,
  payload: data,
});