import {
  CREATE_COLLABORATION_ADS_REQUEST,
  CREATE_COLLABORATION_ADS_SUCCESS,
  CREATE_COLLABORATION_ADS_FAIL,
} from '../actions/collaborationAdsActions';
const initialState = {
  title: '',
  category: '',
  description: '',
  imageUrl: '',
  location: '',
  applyLink: '',
  jobDetailsLink: '',
};

/* eslint-disable-next-line default-param-last */
const collaborationAdsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_COLLABORATION_ADS_REQUEST:
      return { ...state, loading: true, error: null };
    case CREATE_COLLABORATION_ADS_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case CREATE_COLLABORATION_ADS_FAIL:
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};

export default collaborationAdsReducer;
