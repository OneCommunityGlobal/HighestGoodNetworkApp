const initialState = {
  connectionStatus: null, // null = not yet loaded, object = loaded
  loading: false,
};

const SET_FB_CONNECTION_STATUS = 'SET_FB_CONNECTION_STATUS';
const SET_FB_CONNECTION_LOADING = 'SET_FB_CONNECTION_LOADING';

export { SET_FB_CONNECTION_STATUS, SET_FB_CONNECTION_LOADING };

export default function facebookReducer(state = initialState, action) {
  switch (action.type) {
    case SET_FB_CONNECTION_LOADING:
      return { ...state, loading: action.payload };
    case SET_FB_CONNECTION_STATUS:
      return { ...state, connectionStatus: action.payload, loading: false };
    default:
      return state;
  }
}
