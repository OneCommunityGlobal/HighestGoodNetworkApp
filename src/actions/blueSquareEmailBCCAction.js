import * as types from '../constants/BluequareEmailBccConstants';
import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import { toast } from 'react-toastify';

const getAllBlueSquareEmailBccs = allAssignements => ({
  type: types.GET_BLUE_SQUARE_EMAIL_ASSIGNMENTS,
  payload: allAssignements,
});

const setBlueSquareEmailBcc = emailAssignement => ({
  type: types.SET_BLUE_SQUARE_EMAIL_ASSIGNMENT,
  payload: emailAssignement,
});

const deleteBlueSquareEmailBcc = id => ({
  type: types.DELETE_BLUE_SQUARE_EMAIL_ASSIGNMENT,
  payload: id,
});

const blueSquareEmailBccError = error => ({
  type: types.BLUE_SQUARE_EMAIL_ASSIGNMENT_ERROR,
  payload: error,
});

export const getAllBlueSquareEmailAssignements = () => {
  const url = ENDPOINTS.BLUE_SQUARE_EMAIL_BCC();
  return async dispatch => {
    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        dispatch(getAllBlueSquareEmailBccs(response.data));
      } else {
        dispatch(blueSquareEmailBccError(response.data));
      }
    } catch (err) {
        dispatch(blueSquareEmailBccError(err));
    }
  };
};

export const setBlueSquareEmailAssignement = email => {
  const url = ENDPOINTS.BLUE_SQUARE_EMAIL_BCC();
  return async dispatch => {
    try {
      const response = await axios.post(url, {email});
      if (response.status === 200) {
        dispatch(setBlueSquareEmailBcc(response.data));
      } else {
        dispatch(blueSquareEmailBccError(response.data));
      }
    } catch (err) {
        dispatch(blueSquareEmailBccError(err));
    }
  };
};

export const deleteBlueSquareEmailAssignement = id => {
    const url = ENDPOINTS.DELETE_BLUE_SQUARE_EMAIL_BCC(id);
    return async dispatch => {
      try {
        const response = await axios.delete(url);
        if (response.status === 200) {
            console.log(response.data)
          dispatch(deleteBlueSquareEmailBcc(response.data.id));
        } else {
          dispatch(blueSquareEmailBccError(response.data));
        }
      } catch (err) {
          dispatch(blueSquareEmailBccError(err));
      }
    };
  };