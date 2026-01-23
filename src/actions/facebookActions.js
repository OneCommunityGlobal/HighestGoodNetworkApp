import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';

export const postFacebookContent = ({ message, link, imageUrl, pageId, requestor }) => async () => {
  try {
    const payload = {
      message,
      link,
      imageUrl,
      pageId,
      requestor,
    };

    const { data } = await axios.post(ENDPOINTS.FACEBOOK_POST, payload);
    toast.success('Facebook post created.');
    return data;
  } catch (error) {
    const detail =
      error.response?.data?.details ||
      error.response?.data?.error ||
      error.response?.data ||
      error.message;
    toast.error(`Failed to post to Facebook: ${detail}`);
    throw error;
  }
};

export const scheduleFacebookPost =
  ({ message, scheduledFor, timezone = 'America/Los_Angeles', link, imageUrl, pageId, requestor }) =>
  async () => {
    try {
      const payload = {
        message,
        scheduledFor,
        timezone,
        link,
        imageUrl,
        pageId,
        requestor,
      };

      const { data } = await axios.post(ENDPOINTS.FACEBOOK_SCHEDULE_POST, payload);
      toast.success('Facebook post scheduled.');
      return data;
    } catch (error) {
      const detail =
        error.response?.data?.details ||
        error.response?.data?.error ||
        error.response?.data ||
        error.message;
      toast.error(`Failed to schedule Facebook post: ${detail}`);
      throw error;
    }
  };

/**
 * Schedules a Facebook post with direct image file upload
 */
export const scheduleFacebookPostWithImage = (formData) => async () => {
  try {
    const { data } = await axios.post(ENDPOINTS.FACEBOOK_SCHEDULE_POST_UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });
    toast.success('Facebook post scheduled.');
    return data;
  } catch (error) {
    const detail =
      error.response?.data?.details ||
      error.response?.data?.error ||
      error.response?.data ||
      error.message;
    toast.error(`Failed to schedule Facebook post: ${detail}`);
    throw error;
  }
};

// ============================================
// NEW ACTIONS
// ============================================

/**
 * Fetches pending/sending scheduled posts
 */
export const fetchScheduledPosts =
  ({ requestor, status, limit = 50, skip = 0 }) =>
  async () => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('limit', limit);
      params.append('skip', skip);
      params.append('requestor', JSON.stringify(requestor));

      const { data } = await axios.get(`${ENDPOINTS.FACEBOOK_SCHEDULED}?${params.toString()}`);
      return data;
    } catch (error) {
      const detail =
        error.response?.data?.details || error.response?.data?.error || error.message;
      toast.error(`Failed to fetch scheduled posts: ${detail}`);
      throw error;
    }
  };

/**
 * Fetches post history (MongoDB sent posts + Facebook Graph API posts)
 */
export const fetchPostHistory =
  ({ requestor, limit = 25, source = 'all', pageId, status, postMethod }) =>
  async () => {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit);
      params.append('source', source);
      if (pageId) params.append('pageId', pageId);
      if (status) params.append('status', status);
      if (postMethod) params.append('postMethod', postMethod);
      params.append('requestor', JSON.stringify(requestor));

      const { data } = await axios.get(`${ENDPOINTS.FACEBOOK_HISTORY}?${params.toString()}`);
      return data;
    } catch (error) {
      const detail =
        error.response?.data?.details || error.response?.data?.error || error.message;
      toast.error(`Failed to fetch post history: ${detail}`);
      throw error;
    }
  };

/**
 * Cancels a pending scheduled post
 */
export const cancelScheduledPost =
  ({ postId, requestor }) =>
  async () => {
    try {
      const { data } = await axios.delete(`${ENDPOINTS.FACEBOOK_SCHEDULE}/${postId}`, {
        data: { requestor },
      });
      toast.success('Scheduled post cancelled.');
      return data;
    } catch (error) {
      const detail =
        error.response?.data?.details || error.response?.data?.error || error.message;
      toast.error(`Failed to cancel scheduled post: ${detail}`);
      throw error;
    }
  };

/**
 * Updates a pending scheduled post
 */
export const updateScheduledPost =
  ({ postId, message, scheduledFor, timezone, link, imageUrl, requestor }) =>
  async () => {
    try {
      const payload = { message, scheduledFor, timezone, link, imageUrl, requestor };
      const { data } = await axios.put(`${ENDPOINTS.FACEBOOK_SCHEDULE}/${postId}`, payload);
      toast.success('Scheduled post updated.');
      return data;
    } catch (error) {
      const detail =
        error.response?.data?.details || error.response?.data?.error || error.message;
      toast.error(`Failed to update scheduled post: ${detail}`);
      throw error;
    }
  };

export const postFacebookContentWithImage = (formData) => async () => {
  try {
    const { data } = await axios.post(ENDPOINTS.FACEBOOK_POST_UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Increase timeout for larger files
      timeout: 60000,
    });
    toast.success('Facebook post created.');
    return data;
  } catch (error) {
    const detail =
      error.response?.data?.details ||
      error.response?.data?.error ||
      error.response?.data ||
      error.message;
    toast.error(`Failed to post to Facebook: ${detail}`);
    throw error;
  }
};
