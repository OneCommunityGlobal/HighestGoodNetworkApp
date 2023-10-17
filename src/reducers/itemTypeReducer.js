export const FETCH_ITEMTYPES_START = 'FETCH_ITEMTYPES_START';
export const RECEIVE_ITEMTYPES = 'RECEIVE_ITEMTYPES';
export const FETCH_ITEMTYPES_ERROR = 'FETCH_ITEMTYPES_ERROR';
export const ADD_NEW_ITEMTYPE = 'ADD_NEW_ITEMTYPE';

const initialState = {
  allItemTypes: [],
  isLoading: false,
};

export const itemTypeReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ITEMTYPES_START:
      return {
        ...state,
        isLoading: true,
      };

    case RECEIVE_ITEMTYPES:
      return {
        ...state,
        allItemTypes: action.payload,
        isLoading: false,
      }

    case FETCH_ITEMTYPES_ERROR:
      return {
        ...state,
        isLoading: false,
      }

    case ADD_NEW_ITEMTYPE:
      return {
        ...state,
        allItemTypes: [
          ...state.allItemTypes,
          action.payload,
        ],
      }

    default:
      return state;
  }
};