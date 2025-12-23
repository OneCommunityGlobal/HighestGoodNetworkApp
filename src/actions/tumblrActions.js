import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

export const FETCH_TUMBLR_POSTS_REQUEST = 'FETCH_TUMBLR_POSTS_REQUEST';
export const FETCH_TUMBLR_POSTS_SUCCESS = 'FETCH_TUMBLR_POSTS_SUCCESS';
export const FETCH_TUMBLR_POSTS_FAILURE = 'FETCH_TUMBLR_POSTS_FAILURE';

export const CREATE_TUMBLR_POST_REQUEST = 'CREATE_TUMBLR_POST_REQUEST';
export const CREATE_TUMBLR_POST_SUCCESS = 'CREATE_TUMBLR_POST_SUCCESS';
export const CREATE_TUMBLR_POST_FAILURE = 'CREATE_TUMBLR_POST_FAILURE';

export const DELETE_TUMBLR_POST_REQUEST = 'DELETE_TUMBLR_POST_REQUEST';
export const DELETE_TUMBLR_POST_SUCCESS = 'DELETE_TUMBLR_POST_SUCCESS';
export const DELETE_TUMBLR_POST_FAILURE = 'DELETE_TUMBLR_POST_FAILURE';

// Fetch posts
export const fetchTumblrPosts = () => async (dispatch) => {
  dispatch({ type: FETCH_TUMBLR_POSTS_REQUEST });

  try {
    const { data } = await axios.get(ENDPOINTS.TUMBLR_POSTS);
    dispatch({ type: FETCH_TUMBLR_POSTS_SUCCESS, payload: data.posts || [] });
  } catch (error) {
    dispatch({
      type: FETCH_TUMBLR_POSTS_FAILURE,
      payload: error.response?.data?.error || error.message || 'Failed to fetch posts',
    });
  }
};

// Create post
export const createTumblrPost = (postData) => async (dispatch) => {
  dispatch({ type: CREATE_TUMBLR_POST_REQUEST });

  try {
    const { data } = await axios.post(`${ENDPOINTS.TUMBLR_POST}`, postData);
    dispatch({ type: CREATE_TUMBLR_POST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: CREATE_TUMBLR_POST_FAILURE,
      payload: error.response?.data?.error || error.message || 'Failed to create post',
    });
  }
};

// Delete post
export const deleteTumblrPost = (postId) => async (dispatch) => {
  dispatch({ type: DELETE_TUMBLR_POST_REQUEST });

  try {
    await axios.delete(`${ENDPOINTS.TUMBLR_POSTS}/${postId}`);
    dispatch({ type: DELETE_TUMBLR_POST_SUCCESS, payload: postId });
  } catch (error) {
    dispatch({
      type: DELETE_TUMBLR_POST_FAILURE,
      payload: error.response?.data?.error || error.message || 'Failed to delete post',
    });
  }
};
