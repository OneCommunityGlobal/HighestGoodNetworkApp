import {
  SET_REUSABLES,
  POST_UPDATE_REUSABLE_START_BULK,
  POST_UPDATE_REUSABLE_END_BULK,
  RESET_UPDATE_REUSABLE_BULK,
  POST_UPDATE_REUSABLE_ERROR_BULK,
  POST_UPDATE_REUSABLE_START,
  POST_UPDATE_REUSABLE_END,
  RESET_UPDATE_REUSABLE,
  POST_UPDATE_REUSABLE_ERROR,
} from 'constants/bmdashboard/reusableConstants';

const defaultState = {
  reusablesList: [],
  updateReusables: {
    loading: false,
    result: null,
    error: undefined,
  },
  updateReusablesBulk: {
    loading: false,
    result: null,
    error: undefined,
  },
};

// eslint-disable-next-line default-param-last
export default function reusablesReducer(reusables = defaultState, action) {
  switch (action.type) {
    case SET_REUSABLES: {
      return {
        ...reusables,
        reusablesList: action.payload,
        updateReusables: { ...defaultState.updateReusables },
        updateReusablesBulk: { ...defaultState.updateReusablesBulk },
      };
    }
    case POST_UPDATE_REUSABLE_START: {
      const obj = { loading: true };
      return { ...reusables, updateReusables: obj };
    }
    case POST_UPDATE_REUSABLE_END: {
      const obj = {
        result: action.payload,
        loading: false,
        error: false,
      };
      return { ...reusables, updateReusables: obj };
    }
    case POST_UPDATE_REUSABLE_ERROR: {
      const obj = {
        result: action.payload,
        loading: false,
        error: true,
      };
      return { ...reusables, updateReusables: obj };
    }
    case RESET_UPDATE_REUSABLE: {
      const obj = {
        loading: false,
        result: null,
        error: undefined,
      };
      return { ...reusables, updateReusables: obj };
    }
    case POST_UPDATE_REUSABLE_START_BULK: {
      const obj = { loading: true };
      return { ...reusables, updateReusablesBulk: obj };
    }
    case POST_UPDATE_REUSABLE_END_BULK: {
      const obj = { result: action.payload, loading: false, error: false };
      return { ...reusables, updateReusablesBulk: obj };
    }
    case POST_UPDATE_REUSABLE_ERROR_BULK: {
      const obj = { result: action.payload, loading: false, error: true };
      return { ...reusables, updateReusablesBulk: obj };
    }
    case RESET_UPDATE_REUSABLE_BULK: {
      const obj = { loading: false, result: null, error: undefined };
      return { ...reusables, updateReusablesBulk: obj };
    }
    default:
      return reusables;
  }
}
