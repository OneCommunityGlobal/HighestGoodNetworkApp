import { FETCH_PDF_SUMMARY, FETCH_PDF_SUMMARY_SUCCESS, FETCH_PDF_SUMMARY_FAILURE } from './pdfSummaryActionTypes';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const pdfSummaryReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PDF_SUMMARY:
      return {
        ...state,
        loading: true,
      };
    case FETCH_PDF_SUMMARY_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
      };
    case FETCH_PDF_SUMMARY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    default:
      return state;
  }
};

export default pdfSummaryReducer;
