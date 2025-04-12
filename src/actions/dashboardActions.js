export const INCREMENT_DASHBOARD_TASK_COUNT = 'INCREMENT_DASHBOARD_TASK_COUNT';
export const UPDATE_SUMMARY_BAR_DATA = 'UPDATE_SUMMARY_BAR_DATA'

export const incrementDashboardTaskCount = (taskId) => {
  console.log(`Dispatching incrementDashboardTaskCount for task ID: ${taskId}`);
  return {
    type: INCREMENT_DASHBOARD_TASK_COUNT,
    payload: { taskId },
  };
};

export const updateSummaryBarData = ({summaryBarData}) => {
  console.log(summaryBarData);
  return {
    type: UPDATE_SUMMARY_BAR_DATA,
    payload: { summaryBarData },
  };
};
