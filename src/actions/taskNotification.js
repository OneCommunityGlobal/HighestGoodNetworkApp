import httpService from '../services/httpService';
import { ENDPOINTS } from '../utils/URL';

export const createOrUpdateTaskNotification = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const userIds = selectFetchTeamMembersTaskData(state); // TODO: get userIds
    dispatch(createOrUpdateTaskNotificationBegin());
    // what should endpoint return? want create/update to behave the same
    const response = await axios.get(`${ENDPOINTS.APIEndpoint()}/tasknotification`); // TODO: add to URLs
    dispatch(createOrUpdateTaskNotificationSuccess(response.data));
  } catch (error) {
    dispatch(createOrUpdateTaskNotificationError());
  }
}