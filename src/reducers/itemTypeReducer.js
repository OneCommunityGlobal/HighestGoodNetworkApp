export const FETCH_ITEMTYPES_START = 'FETCH_ITEMTYPES_START';
export const RECEIVE_ITEMTYPES = 'RECEIVE_ITEMTYPES';
export const FETCH_ITEMTYPES_ERROR = 'FETCH_ITEMTYPES_ERROR';
export const ADD_NEW_ITEMTYPE = 'ADD_NEW_ITEMTYPE';

const initialState = {
  allItemTypes: [],
  fetching: false,
  fetched: false,
  status: 404,
};

export const itemTypeReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ITEMTYPES_START:
      return {
        ...state,
        fetching: true,
        fetched: false,
        status: 404,
      };

    case RECEIVE_ITEMTYPES:
      return {
        ...state,
        allItemTypes: action.payload,
        fetching: false,
        fetched: true,
        status: 200,
      }

    case FETCH_ITEMTYPES_ERROR:
      return {
        ...state,
        fetching: false,
        fetched: false,
        status: action.status,
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