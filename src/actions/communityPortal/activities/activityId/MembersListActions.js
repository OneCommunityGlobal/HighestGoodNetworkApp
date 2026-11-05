import { MEMBERS_LIST_REQUEST, MEMBERS_LIST_REQUEST_SUCCESS, MEMBERS_LIST_REQUEST_FAILURE } from '../../../../constants/communityPortal/activities/activityId/MembersListConstants';

import { members } from '../../../../components/CommunityPortal/Activities/activityId/MembersListMockData';

export const fetchMembersList = () => {
  return async (dispatch) => {
    dispatch({ type: MEMBERS_LIST_REQUEST });

    try {

      dispatch({
        type: MEMBERS_LIST_REQUEST_SUCCESS,
        payload: members, // Replace with actual data fetching logic
      });
    } catch (error) {
      dispatch({
        type: MEMBERS_LIST_REQUEST_FAILURE,
        payload: error.message,
      });
    }
  }
}