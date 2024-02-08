import axios from "axios";
import { ENDPOINTS } from "utils/URL";
import {
  SET_TOOLS, POST_UPDATE_TOOL_START, POST_UPDATE_TOOL_END, RESET_UPDATE_TOOL,
  POST_UPDATE_TOOL_ERROR, POST_UPDATE_TOOL_START_BULK, POST_UPDATE_TOOL_END_BULK,
  RESET_UPDATE_TOOL_BULK, POST_UPDATE_TOOL_ERROR_BULK
} from "constants/bmdashboard/toolConstants";
import { GET_ERRORS } from "constants/errors";

export const setTools = payload => {
  return {
    type: SET_TOOLS,
    payload
  }
}

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload
  }
}

export const toolUpdateStart = () => {
  return {
    type: POST_UPDATE_TOOL_START
  }
}

export const toolUpdateEnd = payload => {
  return {
    type: POST_UPDATE_TOOL_END,
    payload
  }
}

export const toolUpdateError = payload => {
  return {
    type: POST_UPDATE_TOOL_ERROR,
    payload
  }
}

export const resetToolUpdate = () => {
  return { type: RESET_UPDATE_TOOL }
}

export const toolUpdateStartBulk = () => {
  return {
    type: POST_UPDATE_TOOL_START_BULK
  }
}

export const toolUpdateEndBulk = payload => {
  return {
    type: POST_UPDATE_TOOL_END_BULK,
    payload
  }
}

export const toolUpdateErrorBulk = payload => {
  return {
    type: POST_UPDATE_TOOL_ERROR_BULK,
    payload
  }
}

export const resetToolUpdateBulk = () => {
  return { type: RESET_UPDATE_TOOL_BULK }
}


export const fetchAllTools = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_TOOLS)
      .then(res => {
        dispatch(setTools(res.data))
      })
      .catch(err => {
        dispatch(setErrors(err))
      })
  }
}

export const postToolUpdate = (payload) => {
  return async dispatch => {
    dispatch(toolUpdateStart())
    axios.post(ENDPOINTS.BM_UPDATE_TOOL, payload)
      .then(res => {
        dispatch(toolUpdateEnd(res.data))
      })
      .catch((error) => {
        if (error.response) {
          dispatch(toolUpdateError(error.response.data));
        } else if (error.request) {
          dispatch(toolUpdateError(error.request));
        } else {
          dispatch(toolUpdateError(error));
        }
      })
  }
}

export const postToolUpdateBulk = (payload) => {
  return async dispatch => {
    dispatch(toolUpdateStartBulk())
    axios.post(ENDPOINTS.BM_UPDATE_TOOL_BULK, payload)
      .then(res => {
        dispatch(toolUpdateEndBulk(res.data.result))
      })
      .catch((error) => {
        if (error.response) {
          dispatch(toolUpdateErrorBulk(error.response.data));
        } else if (error.request) {
          dispatch(toolUpdateErrorBulk(error.request));
        } else {
          dispatch(toolUpdateErrorBulk(error));
        }
      })
  }
}

export const purchaseTool = async (body) => {
  return axios.post(ENDPOINTS.BM_TOOLS, body)
    .then(res => res)
    .catch((err) => {
      if (err.response) return err.response
      if (err.request) return err.request
      return err.message
    })
}

