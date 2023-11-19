import * as actions from '../constants/information';

const initialState = {
  infos: [],
  loading: false,
  fetchError: null,
};

// eslint-disable-next-line import/prefer-default-export
export const infoCollectionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.FETCH_INFOS_BEGIN:
      return {
        ...state,
        loading: true,
        fetchError: null,
      };

    case actions.FETCH_INFOS_SUCCESS:
      return {
        ...state,
        loading: false,
        infos: action.payload.infoCollectionsData,
      };

    case actions.FETCH_INFOS_ERROR:
      return {
        ...state,
        loading: false,
        fetchError: action.payload.error,
      };
    case actions.ADD_INFO_SUCCESS:
        return {
          ...state,
          infoCollections: [...state.infoCollections, action.payload.newInfo],
        };
  
    default:
      return state;
  }
};
