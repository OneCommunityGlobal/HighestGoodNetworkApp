// src/actions/pdfSummaryActions.js

import { FETCH_PDF_SUMMARY, FETCH_PDF_SUMMARY_SUCCESS, FETCH_PDF_SUMMARY_FAILURE } from '../constants/pdfSummaryActionTypes.js'; // Ensure the correct path and extension
import axios from 'axios';

export const fetchPdfSummary = () => async (dispatch) => {
  dispatch({ type: FETCH_PDF_SUMMARY });

  try {
    const response = await axios.get('/api/pdf-summary'); // Replace with your API endpoint
    dispatch({ type: FETCH_PDF_SUMMARY_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_PDF_SUMMARY_FAILURE, error });
  }
};
