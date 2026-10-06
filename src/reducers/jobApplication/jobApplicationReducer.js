import {
  JOB_APPLICATION_GET_FORMS_REQUEST,
  JOB_APPLICATION_GET_FORMS_SUCCESS,
  JOB_APPLICATION_GET_FORMS_FAIL,
  JOB_APPLICATION_SET_SELECTED_JOB,
} from '../../constants/jobApplication/jobApplicationConstants';

const initialState = {
  loading: false,
  forms: [],
  error: null,
  selectedJob: '',
};

export const jobApplicationReducer = (state = initialState, action) => {
  switch (action.type) {
    case JOB_APPLICATION_GET_FORMS_REQUEST:
      return { ...state, loading: true, error: null };
    case JOB_APPLICATION_GET_FORMS_SUCCESS:
      return { ...state, loading: false, forms: action.payload };
    case JOB_APPLICATION_GET_FORMS_FAIL:
      return { ...state, loading: false, error: action.payload };
    case JOB_APPLICATION_SET_SELECTED_JOB:
      return { ...state, selectedJob: action.payload };
    default:
      return state;
  }
};
