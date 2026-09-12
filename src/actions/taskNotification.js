import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import {
  createOrUpdateTaskNotificationSuccess,
  createOrUpdateTaskNotificationBegin,
  createOrUpdateTaskNotificationError,
} from '../components/TeamMemberTasks/actions';
import { selectFetchTeamMembersTaskData } from '../components/TaskEditSuggestions/thunks';

export const createOrUpdateTaskNotificationHTTP = async (taskId, oldTask, userIds) => {
  try {
    const payload = { oldTask, userIds };
    await axios.post(ENDPOINTS.CREATE_OR_UPDATE_TASK_NOTIFICATION(taskId), payload);
  } catch (error) {
    toast.info(`Error on create or update task notification with error: ${error}`);
  }
};

export const createOrUpdateTaskNotification = () => async (dispatch, getState) => {
  try {
    const state = getState();
    // eslint-disable-next-line no-unused-vars
    const userIds = selectFetchTeamMembersTaskData(state); // TODO: get userIds
    dispatch(createOrUpdateTaskNotificationBegin());
    // what should endpoint return? want create/update to behave the same
    const response = await axios.get(`${ENDPOINTS.APIEndpoint()}/tasknotification`); // TODO: add to URLs
    dispatch(createOrUpdateTaskNotificationSuccess(response.data));
  } catch (error) {
    dispatch(createOrUpdateTaskNotificationError());
  }
};
