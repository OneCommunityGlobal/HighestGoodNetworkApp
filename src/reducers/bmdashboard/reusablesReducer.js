import {
  SET_REUSABLES, POST_UPDATE_REUSABLE_START_BULK, POST_UPDATE_REUSABLE_END_BULK,
  RESET_UPDATE_REUSABLE_BULK, POST_UPDATE_REUSABLE_ERROR_BULK, POST_UPDATE_REUSABLE_START, POST_UPDATE_REUSABLE_END,
  RESET_UPDATE_REUSABLE, POST_UPDATE_REUSABLE_ERROR
} from "constants/bmdashboard/reusableConstants"

const defaultState = {
  reusablesList: [],
  updateReusables: {
    loading: false,
    result: null,
    error: undefined
  },
  updateReusablesBulk: {
    loading: false,
    result: null,
    error: undefined
  }
}

export const reusablesReducer = (reusables = defaultState, action) => {
  switch (action.type) {
    case SET_REUSABLES:
      {
        reusables.reusablesList = action.payload; 
        return {
          ...reusables, updateReusables: { ...defaultState.updateReusables },
          updateReusablesBulk: { ...defaultState.updateReusablesBulk }
        }
      }
    case POST_UPDATE_REUSABLE_START:
      {
        const obj = { loading: true };
        reusables.updateReusables = obj;
        return { ...reusables }
      }
    case POST_UPDATE_REUSABLE_END:
      {
        const obj = {
          result: action.payload,
          loading: false,
          error: false
        }
        reusables.updateReusables = obj;
        return { ...reusables }
      }
    case POST_UPDATE_REUSABLE_ERROR:
      {
        const obj = {
          result: action.payload,
          loading: false,
          error: true
        }
        reusables.updateReusables = obj;
        return { ...reusables }
      }
    case RESET_UPDATE_REUSABLE:
      {
        const obj = {
          loading: false,
          result: null,
          error: undefined
        }
        reusables.updateReusables = obj
        return { ...reusables }

      }
    case POST_UPDATE_REUSABLE_START_BULK:
      {
        const obj = { loading: true }
        reusables.updateReusablesBulk = obj;
        return { ...reusables }
      }
    case POST_UPDATE_REUSABLE_END_BULK:
      {
        const obj = { result: action.payload, loading: false, error: false }
        reusables.updateReusablesBulk = obj;
        return { ...reusables }
      }

    case POST_UPDATE_REUSABLE_ERROR_BULK:
      {
        const obj = { result: action.payload, loading: false, error: true }
        reusables.updateReusablesBulk = obj;
        return { ...reusables }
      }
    case RESET_UPDATE_REUSABLE_BULK:
      {
        const obj = { loading: false, result: null, error: undefined }
        reusables.updateReusablesBulk = obj;
        return { ...reusables }
      }
    default:
      return reusables;
  }
}