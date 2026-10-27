import * as actions from '../constants/information';

const initialState = {
  infos: [],
  loading: false,
  loaded: false,
  fetchError: null,
};

// eslint-disable-next-line default-param-last
export const infoCollectionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.FETCH_INFOS_BEGIN:
      return {
        ...state,
        loading: true,
        loaded: false,
        fetchError: null,
      };

    case actions.FETCH_INFOS_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        infos: action.payload.infoCollectionsData,
      };

    case actions.FETCH_INFOS_ERROR:
      return {
        ...state,
        loading: false,
        loaded: false,
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

export default infoCollectionsReducer;
