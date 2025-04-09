import { toast } from 'react-toastify';

export const INCREMENT_DASHBOARD_TASK_COUNT = 'INCREMENT_DASHBOARD_TASK_COUNT';

export const incrementDashboardTaskCount = taskId => {
  toast.info(`Dispatching incrementDashboardTaskCount for task ID: ${taskId}`);
  return {
    type: INCREMENT_DASHBOARD_TASK_COUNT,
    payload: { taskId },
  };
};
