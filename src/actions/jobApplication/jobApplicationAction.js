import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import {
  JOB_APPLICATION_GET_FORMS_REQUEST,
  JOB_APPLICATION_GET_FORMS_SUCCESS,
  JOB_APPLICATION_GET_FORMS_FAIL,
  JOB_APPLICATION_SET_SELECTED_JOB,
} from '../../constants/jobApplication/jobApplicationConstants';

export const getAllForms = () => async dispatch => {
  dispatch({ type: JOB_APPLICATION_GET_FORMS_REQUEST });
  try {
    const { data } = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS);
    dispatch({ type: JOB_APPLICATION_GET_FORMS_SUCCESS, payload: data.data });
  } catch (error) {
    dispatch({
      type: JOB_APPLICATION_GET_FORMS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const setSelectedJob = jobTitle => ({
  type: JOB_APPLICATION_SET_SELECTED_JOB,
  payload: jobTitle,
});