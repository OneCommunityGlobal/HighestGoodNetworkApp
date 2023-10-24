import axios from 'axios';
import * as actions from '../constants/inventoryMaterial';
import { ENDPOINTS } from '../utils/URL';


// ACTION CREATORS
export const beginMaterialsByProjAndCheckInOutSuccess = () => ({
  type: actions.FETCH_MATERIALS_BY_PROJ_CHECKINOUT_BEGIN
});
export const fetchMaterialsByProjAndCheckInOutSuccess = result => ({
  type: actions.FETCH_MATERIALS_BY_PROJ_CHECKINOUT_SUCCESS,
  payload: { result }
});
export const fetchMaterialsByProjAndCheckInOutError = result => ({
  type: actions.FETCH_MATERIALS_BY_PROJ_CHECKINOUT_ERROR,
  payload: { error: result }
});
export const resetMaterialsByProjAndCheckInOut = () => ({
  type: actions.RESET_MATERIALS_BY_PROJ_CHECKINOUT
});
export const resetLogMaterialsResult = () => ({
  type: actions.RESET_LOG_MATERIALS_RESULT
})
export const postedLogMaterialsResult = (result) => ({
  type: actions.POSTED_LOG_MATERIALS_RESULT,
  payload: result
});

//////////////////////////////////////////////////////////////////////////

// API CALLS
export const getMaterialsByProjAndCheckInOutSuccess = (payload) => {
  let url = ENDPOINTS.BM_MATERIALS_BY_PROJ_AND_CHECKINOUT;
  return async (dispatch) => {
    dispatch(beginMaterialsByProjAndCheckInOutSuccess())
    try {
      url = url + `?projectId=${payload.projectId}&checkInOut=${payload.checkInOut}`
      const response = await axios.get(url);
      dispatch(fetchMaterialsByProjAndCheckInOutSuccess(response.data));
      return response.status;
    } catch (error) {
      dispatch(fetchMaterialsByProjAndCheckInOutError(error))
      console.error(error);
    }
  };
};


export const postMaterialLog = (materialLogs, date) => async (dispatch) => {
  const url = ENDPOINTS.BM_POST_MATERIAL_LOG;
  const payload = { materialLogs, date }
  try {
    const response = await axios.post(url, { payload });
    dispatch(postedLogMaterialsResult(response))
  }
  catch (error) {
    dispatch(postedLogMaterialsResult(error))
  }
};
