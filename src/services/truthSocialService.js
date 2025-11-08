import axios from 'axios';

const API_BASE = process.env.REACT_APP_APIENDPOINT || 'http://localhost:4500/api';

// Get auth token - your app stores it as 'Authorization' in localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) return {};

  // Return the token in the format your backend expects
  return {
    Authorization: token, // The backend reads from req.header('Authorization')
  };
};

export const truthSocialService = {
  /**
   * Post to Truth Social immediately
   */
  async createPost(postData) {
    try {
      const response = await axios.post(`${API_BASE}/truthsocial/post`, postData, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Schedule a post for later
   */
  async schedulePost(postData) {
    try {
      const response = await axios.post(`${API_BASE}/truthsocial/schedule`, postData, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get all scheduled posts
   */
  async getScheduledPosts() {
    try {
      const response = await axios.get(`${API_BASE}/truthsocial/scheduled`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete a scheduled post
   */
  async deleteScheduledPost(postId) {
    try {
      const response = await axios.delete(`${API_BASE}/truthsocial/scheduled/${postId}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Save API token
   */
  async updateApiToken(token) {
    try {
      const response = await axios.post(
        `${API_BASE}/truthsocial/token`,
        { token },
        { headers: getAuthHeader() },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get API token (masked)
   */
  async getApiToken() {
    try {
      const response = await axios.get(`${API_BASE}/truthsocial/token`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
