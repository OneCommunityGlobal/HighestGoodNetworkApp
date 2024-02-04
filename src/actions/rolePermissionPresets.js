import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import * as types from "../constants/rolePermissionPresets";

export const fetchPresets = (presets) => {
  return {
    type: types.RECEIVE_PRESETS,
    presets,
  };
};

export const postNewPreset = payload => {
  return {
    type: types.ADD_NEW_PRESET,
    payload,
  };
};

export const deletePreset = presetId => {
  return {
    type: types.DELETE_PRESET,
    presetId,
  };
};

export const updatePreset = payload => {
  return {
    type: types.UPDATE_PRESET,
    payload,
  };
};

export const getPresetsByRole = (roleName) => async dispatch => {
  const URL = ENDPOINTS.PRESETS_BY_ID(roleName);
  const { data } = await axios.get(URL);
  return dispatch(fetchPresets(data));
};

export const createNewPreset = newPreset => {
  return async dispatch => {
    try {
      const res = await axios.post(ENDPOINTS.PRESETS(), newPreset);
      if (res.status === 201){
        dispatch(postNewPreset(res.data.newPreset));
      }
      return 0;
    } catch (error) {
      console.log(error)
      return 1;
    }
  };
};

export const updatePresetById = (updatedPreset) => {
  return async dispatch => {
    try {
      const res = await axios.put(ENDPOINTS.PRESETS_BY_ID(updatedPreset._id), updatedPreset);
      if (res.status === 200){
        dispatch(updatePreset(updatedPreset));
      }
    } catch (err) {
      console.log(err);
    }
  };
};

export const deletePresetById = (presetId) => {
  return async dispatch => {
    try {
      const res = await axios.delete(ENDPOINTS.PRESETS_BY_ID(presetId));
      if (res.status === 200){
        dispatch(deletePreset(presetId));
        return 0;
      }
    } catch (error) {
      console.log(error);
      return 1;
    }
  };
};
