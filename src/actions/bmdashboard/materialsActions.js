import axios from "axios";

import { ENDPOINTS } from "utils/URL";
import { SET_MATERIALS } from "constants/bmdashboard/materialsConstants";

export const fetchAllMaterials = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_MATERIALS_LIST)
    .then(res => {
      dispatch(setMaterials(res.data))
    })
    .catch(err => console.log(err))
  } 
}

export const setMaterials = payload => {
  return {
    type: SET_MATERIALS,
    payload
  }
}