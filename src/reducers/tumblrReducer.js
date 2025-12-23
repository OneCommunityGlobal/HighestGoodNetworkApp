import {
  FETCH_TUMBLR_POSTS_REQUEST,
  FETCH_TUMBLR_POSTS_SUCCESS,
  FETCH_TUMBLR_POSTS_FAILURE,
  CREATE_TUMBLR_POST_REQUEST,
  CREATE_TUMBLR_POST_SUCCESS,
  CREATE_TUMBLR_POST_FAILURE,
  DELETE_TUMBLR_POST_REQUEST,
  DELETE_TUMBLR_POST_SUCCESS,
  DELETE_TUMBLR_POST_FAILURE,
} from '../actions/tumblrActions';

const initialState = {
  loading: false,
  posts: [],
  error: '',
};

const tumblrReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TUMBLR_POSTS_REQUEST:
    case CREATE_TUMBLR_POST_REQUEST:
    case DELETE_TUMBLR_POST_REQUEST:
      return { ...state, loading: true, error: '' };

    case FETCH_TUMBLR_POSTS_SUCCESS:
      return { ...state, loading: false, posts: action.payload, error: '' };

    case FETCH_TUMBLR_POSTS_FAILURE:
    case CREATE_TUMBLR_POST_FAILURE:
    case DELETE_TUMBLR_POST_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case CREATE_TUMBLR_POST_SUCCESS:
      return { ...state, loading: false, posts: [action.payload, ...state.posts], error: '' };

    case DELETE_TUMBLR_POST_SUCCESS:
      return {
        ...state,
        loading: false,
        posts: state.posts.filter(post => post.id !== action.payload),
        error: '',
      };

    default:
      return state;
  }
};

export default tumblrReducer;
