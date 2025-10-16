import { handleActions } from 'redux-actions';

const initialState = {
  catalog: [],
  catalogLoading: false,
  catalogError: null,

  byUser: {},
  updating: false,
  updateError: null,
};

export default handleActions(
  {
    FETCH_USER_STATE_CATALOG_BEGIN: state => ({
      ...state,
      catalogLoading: true,
      catalogError: null,
    }),

    FETCH_USER_STATE_CATALOG_SUCCESS: (state, { payload }) => {
      const items = Array.isArray(payload) ? payload.slice() : [];
      items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return {
        ...state,
        catalog: items,
        catalogLoading: false,
        catalogError: null,
      };
    },

    FETCH_USER_STATE_CATALOG_ERROR: (state, { payload }) => ({
      ...state,
      catalogLoading: false,
      catalogError: payload || 'Failed to load catalog',
    }),

    UPDATE_USER_STATE_BEGIN: state => ({
      ...state,
      updating: true,
      updateError: null,
    }),

    UPDATE_USER_STATE_SUCCESS: (state, { payload }) => {
      // payload = { userId, stateIndicators }
      const { userId, stateIndicators } = payload || {};
      if (!userId) return { ...state, updating: false };

      return {
        ...state,
        updating: false,
        byUser: {
          ...state.byUser,
          [userId]: Array.isArray(stateIndicators) ? stateIndicators : [],
        },
      };
    },

    UPDATE_USER_STATE_ERROR: (state, { payload }) => ({
      ...state,
      updating: false,
      updateError: payload || 'Failed to update user state',
    }),
  },
  initialState,
);

export const selectUserStateCatalog = root => root.userState?.catalog || [];
export const selectUserStateIsLoading = root => !!root.userState?.catalogLoading;
export const selectUserStateForUser = (root, userId) =>
  (root.userState?.byUser && root.userState.byUser[userId]) || [];
export const selectUserStateUpdating = root => !!root.userState?.updating;
export const selectUserStateError = root => root.userState?.updateError;
