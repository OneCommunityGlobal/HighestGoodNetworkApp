import axios from 'axios';
import {
  ADD_NEW_SUMMARYGROUP,
  RECEIVE_ALL_SUMMARY_GROUP,
  SUMMARYGROUP_DELETE,
  UPDATE_SUMMARYGROUP,
} from 'constants/allSummaryGroupConstants';
import { ENDPOINTS } from '../utils/URL';

export const addNewSummaryGroup = (payload, status) => ({
  type: ADD_NEW_SUMMARYGROUP,
  payload,
  status,
});

export const postNewSummaryGroup = (name, status) => {
  const data = { summaryGroupName: name, isActive: status };
  const summaryGroupCreationPromise = axios.post(ENDPOINTS.SUMMARY_GROUPS, data);
  return dispatch => {
    summaryGroupCreationPromise.then(res => {
      if (res && res.data) {
        dispatch(addNewSummaryGroup(res.data, true));
      }
    });
  };
};

export const SummaryGroupFectchACtion = payload => ({
  type: RECEIVE_ALL_SUMMARY_GROUP,
  payload,
});

export const getAllSummaryGroup = () => {
  const SummaryGroupPromise = axios.get(ENDPOINTS.SUMMARY_GROUPS);
  return async (dispatch, getState) => {
    try {
      const res = await SummaryGroupPromise;
      dispatch(SummaryGroupFectchACtion(res.data));
    } catch (err) {
      console.error('getAllSummaryGroup error:', err);
    }
  };
};

export const summaryGroupsDeleteAction = summaryGroupId => ({
  type: SUMMARYGROUP_DELETE,
  summaryGroupId,
});

export const deleteSummaryGroup = summaryGroupId => {
  const deleteTeamPromise = axios.delete(ENDPOINTS.SUMMARY_GROUPS_BY_ID(summaryGroupId));
  return async dispatch => {
    deleteTeamPromise.then(() => {
      dispatch(summaryGroupsDeleteAction(summaryGroupId));
    });
  };
};

export const updateSummaryGroupAction = (summaryGroupId, isActive, summaryGroupName) => ({
  type: UPDATE_SUMMARYGROUP,
  summaryGroupId,
  isActive,
  summaryGroupName,
});

export const updateSummaryGroup = (summaryGroupName, summaryGroupId, isActive) => {
  const requestData = { summaryGroupName, isActive };
  const updateSummaryGroupPromise = axios.put(
    ENDPOINTS.SUMMARY_GROUPS_BY_ID(summaryGroupId),
    requestData,
  );
  return async dispatch => {
    updateSummaryGroupPromise.then(() => {
      dispatch(updateSummaryGroupAction(summaryGroupId, isActive, summaryGroupName));
    });
  };
};

export const extractMembers = id => {
  return async (dispatch, getState) => {
    try {
      const summarydata = getState().allSummaryGroups;
      const groupObject = summarydata.allSummaryGroups.filter(group => group._id === id)[0]
        .teamMembers;

      const result = await Promise.resolve({ teamMembers: groupObject });
      const teamMembers = { teamMembers: result.teamMembers };
      return teamMembers;
      // console.log('Data from redux Store:', groupObject[0].teamMembers);
    } catch (err) {
      console.error('extractMembers:', err);
      return null;
    }
  };
};

export const extractSummaryReceivers = id => {
  return async (dispatch, getState) => {
    try {
      const summarydata = getState().allSummaryGroups;
      const groupObject = summarydata.allSummaryGroups.filter(group => group._id === id)[0]
        .summaryReceivers;

      const result = await Promise.resolve({ summaryReceivers: groupObject });
      const receivers = result.summaryReceivers;
      // console.log('Receiver data is getting here', receivers);
      return receivers;
    } catch (err) {
      console.error('extractSummaryReceivers:', err);
      return null;
    }
  };
};
