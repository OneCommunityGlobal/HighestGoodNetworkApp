// Add required imports
import {
  FETCH_USER_PREFERENCE_START,
  FETCH_USER_PREFERENCE_END,
  UPDATE_USER_PREFERENCE_START,
  UPDATE_USER_PREFERENCE_END,
} from '../../constants/lbdashboard/userPreferenceConstants';

const initialState = {
  user: null,
  notifyInApp: false,
  notifySMS: false,
  notifyEmail: false,
  loading: false,
};
// eslint-disable-next-line default-param-last
const userPreferencesReducer = (state = initialState, action) => {
  // Debug logging
  // console.log('Action:', {
  //     type: action.type,
  //     payload: action.payload
  // });
  // console.log('Current State:', state);
  switch (action.type) {
    case FETCH_USER_PREFERENCE_START:
      return {
        loading: true,
        user: null,
        notifyInApp: false,
        notifySMS: false,
        notifyEmail: false,
      };
    case UPDATE_USER_PREFERENCE_START:
      return {
        loading: true,
        user: state.user,
        notifyInApp: state.notifyInApp,
        notifySMS: state.notifySMS,
        notifyEmail: state.notifyEmail,
      };
    case FETCH_USER_PREFERENCE_END:
    case UPDATE_USER_PREFERENCE_END:
      return {
        // Remove ...state spread
        loading: false,
        user: action.payload?.user || state.user,
        notifyInApp: action.payload?.notifyInApp ?? state.notifyInApp,
        notifySMS: action.payload?.notifySMS ?? state.notifySMS,
        notifyEmail: action.payload?.notifyEmail ?? state.notifyEmail,
      };
    default:
      return state;
  }
};

export default userPreferencesReducer;
