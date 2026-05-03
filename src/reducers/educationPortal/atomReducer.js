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

const initialState = {
  // Data
  availableAtoms: [],

  // Selections
  selectedAtoms: [],

  // Form
  note: '',

  // UI State
  isModalOpen: false,
  studentId: null,
  studentName: '',

  // Loading states
  isLoadingAtoms: false,
  isSubmitting: false,

  // Error states
  atomsError: null,
  submitError: null,
};

// eslint-disable-next-line default-param-last
export const atomReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch atoms
    case FETCH_AVAILABLE_ATOMS_START:
      return {
        ...state,
        isLoadingAtoms: true,
        atomsError: null,
      };
    case FETCH_AVAILABLE_ATOMS_SUCCESS:
      return {
        ...state,
        isLoadingAtoms: false,
        availableAtoms: action.payload,
        atomsError: null,
      };
    case FETCH_AVAILABLE_ATOMS_ERROR:
      return {
        ...state,
        isLoadingAtoms: false,
        atomsError: action.payload,
      };

    // Assignment
    case ASSIGN_ATOMS_START:
      return {
        ...state,
        isSubmitting: true,
        submitError: null,
      };
    case ASSIGN_ATOMS_SUCCESS:
      return {
        ...state,
        isSubmitting: false,
        submitError: null,
        // Clear form after successful submission
        selectedAtoms: [],
        note: '',
      };
    case ASSIGN_ATOMS_ERROR:
      return {
        ...state,
        isSubmitting: false,
        submitError: action.payload,
      };

    // Selection management
    case SELECT_ATOM:
      return {
        ...state,
        selectedAtoms: [...state.selectedAtoms, action.payload],
      };
    case DESELECT_ATOM:
      return {
        ...state,
        selectedAtoms: state.selectedAtoms.filter(id => id !== action.payload),
      };
    case CLEAR_SELECTIONS:
      return {
        ...state,
        selectedAtoms: [],
      };

    // Form management
    case SET_NOTE:
      return {
        ...state,
        note: action.payload,
      };
    case CLEAR_FORM:
      return {
        ...state,
        selectedAtoms: [],
        note: '',
        submitError: null,
      };

    // Modal management
    case SHOW_MODAL:
      return {
        ...state,
        isModalOpen: true,
        studentId: action.payload.studentId,
        studentName: action.payload.studentName,
        submitError: null,
      };
    case HIDE_MODAL:
      return {
        ...state,
        isModalOpen: false,
        studentId: null,
        studentName: '',
        // Clear form when closing modal
        selectedAtoms: [],
        note: '',
        submitError: null,
      };

    default:
      return state;
  }
};

export default atomReducer;
