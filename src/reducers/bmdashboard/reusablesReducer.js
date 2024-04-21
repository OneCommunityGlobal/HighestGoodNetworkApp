import {
  SET_REUSABLES
} from "constants/bmdashboard/reusableConstants"

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

export const reusablesReducer = (state = defaultState, action) => {
  switch (action.type) {
    case SET_REUSABLES:
      return {
        ...state,
        reusablesList: action.payload,
        updateReusables: { ...state.updateReusables, result: null },
        updateReusablesBulk: { ...state.updateReusablesBulk, result: null },
      };
    default:
      return state;
  }
};