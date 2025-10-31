// components/UserState/reducer.js
import { USERSTATE_CATALOG_SET, USERSTATE_BULK_SET, USERSTATE_SET_ONE } from './actions';

const initial = {
  catalog: [],
  byUserId: {}, // { [userId]: ['closing-out','new-dev', ...] }
};

export default function userStateReducer(state = initial, action) {
  switch (action.type) {
    case USERSTATE_CATALOG_SET:
      return { ...state, catalog: action.payload || [] };
    case USERSTATE_BULK_SET:
      return {
        ...state,
        byUserId: { ...state.byUserId, ...(action.payload || {}) },
      };
    case USERSTATE_SET_ONE: {
      const { userId, keys } = action.payload || {};
      if (!userId) return state;
      return {
        ...state,
        byUserId: { ...state.byUserId, [userId]: Array.isArray(keys) ? keys : [] },
      };
    }
    default:
      return state;
  }
}

export const selectUserStateCatalog = (s) => s.userState?.catalog || [];
export const selectUserStateForUser = (s, userId) => s.userState?.byUserId?.[userId] || [];
