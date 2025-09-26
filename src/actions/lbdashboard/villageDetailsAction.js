import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import * as types from '../../constants/lbdashboard/villageDetailsConstants';

// Fetch village dropdown data
export const getVillageDropdownFilterData = () => async dispatch => {
  dispatch({ type: types.FETCH_ALL_VILLAGES_REQUEST });
  try {
    const { data } = await axios.get(ENDPOINTS.LB_VILLAGES);
    dispatch({ type: types.FETCH_ALL_VILLAGES_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: types.FETCH_ALL_VILLAGES_FAILURE, payload: error });
    toast.error(`Error fetching village dropdown filter data: ${error.message}`);
  }
};

// Fetch village details by id
export const getVillageDetailsData = (id) => async dispatch => {
  dispatch({ type: types.FETCH_VILLAGE_DETAILS_REQUEST });
  try {
    const { data } = await axios.get(ENDPOINTS.LB_VILLAGE_BY_ID(id));
    dispatch({ type: types.FETCH_VILLAGE_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: types.FETCH_VILLAGE_DETAILS_FAILURE, payload: error });
    toast.error(`Error fetching village details: ${error.message}`);
  }
};