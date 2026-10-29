import {
  MEMBERS_LIST_REQUEST,
  MEMBERS_LIST_REQUEST_SUCCESS,
  MEMBERS_LIST_REQUEST_FAILURE,
} from '../../../../constants/communityPortal/activities/activityId/MembersListConstants';

export const initialState = {
  loading: false,
  members: [],
  error: null,
};

export const MembersListReducer = (state = initialState, action) => {
  switch (action.type) {
    case MEMBERS_LIST_REQUEST:
      return {
        loading: true,
        members: [],
        error: null,
      };
    case MEMBERS_LIST_REQUEST_SUCCESS: {
      return {
        loading: false,
        members: action.payload,
        error: null,
      };
    }
    case MEMBERS_LIST_REQUEST_FAILURE: {
      return {
        loading: false,
        members: [],
        error: action.payload,
      };
    }
    default:
      return state;
  }
};
