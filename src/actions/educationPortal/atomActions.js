import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import {
  FETCH_AVAILABLE_ATOMS_START,
  FETCH_AVAILABLE_ATOMS_SUCCESS,
  FETCH_AVAILABLE_ATOMS_ERROR,
  ASSIGN_ATOMS_START,
  ASSIGN_ATOMS_SUCCESS,
  ASSIGN_ATOMS_ERROR,
  SELECT_ATOM,
  DESELECT_ATOM,
  CLEAR_SELECTIONS,
  SET_NOTE,
  CLEAR_FORM,
  SHOW_MODAL,
  HIDE_MODAL,
} from '~/constants/educationPortal/atom';

// Fetch available atoms
export const fetchAvailableAtoms = () => {
  return async dispatch => {
    dispatch({ type: FETCH_AVAILABLE_ATOMS_START });
    try {
      const response = await axios.get(`${ENDPOINTS.APIEndpoint()}/atoms`);
      dispatch({
        type: FETCH_AVAILABLE_ATOMS_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      dispatch({
        type: FETCH_AVAILABLE_ATOMS_ERROR,
        payload: error.message,
      });
      toast.error('Failed to load atoms. Please try again.');
    }
  };
};

// Assign atoms to a student
export const assignAtoms = (studentId, atoms, note) => {
  return async dispatch => {
    dispatch({ type: ASSIGN_ATOMS_START });
    try {
      const payload = {
        studentId,
        atomTypes: atoms || [],
        note: note || '',
      };

      const response = await axios.post(ENDPOINTS.EDUCATOR_ASSIGN_ATOMS(), payload);

      dispatch({
        type: ASSIGN_ATOMS_SUCCESS,
        payload: response.data,
      });

      toast.success('Atoms have been assigned', {
        position: 'top-right',
        autoClose: 3000,
      });

      return response.data;
    } catch (error) {
      dispatch({
        type: ASSIGN_ATOMS_ERROR,
        payload: error.message,
      });

      toast.error('Failed to assign atoms. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });

      throw error;
    }
  };
};

// Selection actions
export const selectAtom = atomId => ({
  type: SELECT_ATOM,
  payload: atomId,
});

export const deselectAtom = atomId => ({
  type: DESELECT_ATOM,
  payload: atomId,
});

export const clearSelections = () => ({
  type: CLEAR_SELECTIONS,
});

// Form actions
export const setNote = note => ({
  type: SET_NOTE,
  payload: note,
});

export const clearForm = () => ({
  type: CLEAR_FORM,
});

// Modal actions
export const showModal = (studentId, studentName) => ({
  type: SHOW_MODAL,
  payload: { studentId, studentName },
});

export const hideModal = () => ({
  type: HIDE_MODAL,
});
