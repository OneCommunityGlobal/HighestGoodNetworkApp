import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

// Removed unused import: httpService

export const createOrUpdateTaskNotificationHTTP = async (taskId, oldTask, userIds) => {
  try {
    const payload = { oldTask, userIds };
    await axios.post(ENDPOINTS.CREATE_OR_UPDATE_TASK_NOTIFICATION(taskId), payload);
  } catch (error) {
    // Removed console.log as per no-console rule
    // Optionally, handle the error appropriately here
  }
};

export const createOrUpdateTaskNotification = () => async (dispatch, getState) => {
  try {
    const state = getState();
    // const userIds = selectFetchTeamMembersTaskData(state); // TODO: get userIds
    // dispatch(createOrUpdateTaskNotificationBegin());
    // what should endpoint return? want create/update to behave the same
    const response = await axios.get(`${ENDPOINTS.APIEndpoint()}/tasknotification`); // TODO: add to URLs
    // dispatch(createOrUpdateTaskNotificationSuccess(response.data));
  } catch (error) {
    // dispatch(createOrUpdateTaskNotificationError());
  }
};

// Alternatively, if the undefined functions are essential, define them as placeholders:
// const selectFetchTeamMembersTaskData = (state) => { /* implementation */ };
// const createOrUpdateTaskNotificationBegin = () => ({ type: 'BEGIN_TASK_NOTIFICATION' });
// const createOrUpdateTaskNotificationSuccess = (data) => ({ type: 'SUCCESS_TASK_NOTIFICATION', payload: data });
// const createOrUpdateTaskNotificationError = () => ({ type: 'ERROR_TASK_NOTIFICATION' });
