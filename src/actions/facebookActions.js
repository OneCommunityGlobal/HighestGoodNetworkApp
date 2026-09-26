import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';

const errorDetail = error =>
  error.response?.data?.details ||
  error.response?.data?.error ||
  error.response?.data ||
  error.message;

export const postFacebookContent = payload => async () => {
  try {
    const { data } = await axios.post(ENDPOINTS.FACEBOOK_POST, payload);
    toast.success('Facebook post created.');
    return data;
  } catch (error) {
    toast.error(`Failed to post to Facebook: ${errorDetail(error)}`);
    throw error;
  }
};

export const postFacebookContentWithImage = formData => async () => {
  try {
    const { data } = await axios.post(ENDPOINTS.FACEBOOK_POST_UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    toast.success('Facebook post created.');
    return data;
  } catch (error) {
    toast.error(`Failed to post to Facebook: ${errorDetail(error)}`);
    throw error;
  }
};

export const scheduleFacebookPost =
  ({ timezone = 'America/Los_Angeles', ...post }) =>
  async () => {
    try {
      const { data } = await axios.post(ENDPOINTS.FACEBOOK_SCHEDULE_POST, {
        ...post,
        timezone,
      });
      toast.success('Facebook post scheduled.');
      return data;
    } catch (error) {
      toast.error(`Failed to schedule Facebook post: ${errorDetail(error)}`);
      throw error;
    }
  };

export const scheduleFacebookPostWithImage = formData => async () => {
  try {
    const { data } = await axios.post(ENDPOINTS.FACEBOOK_SCHEDULE_POST_UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    toast.success('Facebook post scheduled.');
    return data;
  } catch (error) {
    toast.error(`Failed to schedule Facebook post: ${errorDetail(error)}`);
    throw error;
  }
};

export const fetchScheduledPosts =
  ({ requestor, status, limit = 50, skip = 0 }) =>
  async () => {
    try {
      const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
      if (status) params.append('status', status);
      if (requestor) params.append('requestor', JSON.stringify(requestor));
      const { data } = await axios.get(`${ENDPOINTS.FACEBOOK_SCHEDULED}?${params.toString()}`);
      return data;
    } catch (error) {
      toast.error(`Failed to fetch scheduled posts: ${errorDetail(error)}`);
      throw error;
    }
  };

export const fetchPostHistory =
  ({ requestor, limit = 25, source = 'all', pageId, status, postMethod }) =>
  async () => {
    try {
      const params = new URLSearchParams({ limit: String(limit), source });
      if (pageId) params.append('pageId', pageId);
      if (status) params.append('status', status);
      if (postMethod) params.append('postMethod', postMethod);
      if (requestor) params.append('requestor', JSON.stringify(requestor));
      const { data } = await axios.get(`${ENDPOINTS.FACEBOOK_HISTORY}?${params.toString()}`);
      return data;
    } catch (error) {
      toast.error(`Failed to fetch post history: ${errorDetail(error)}`);
      throw error;
    }
  };

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
      toast.error(`Failed to cancel scheduled post: ${errorDetail(error)}`);
      throw error;
    }
  };

export const updateScheduledPost =
  ({ postId, message, scheduledFor, timezone, link, imageUrl, requestor }) =>
  async () => {
    try {
      const { data } = await axios.put(`${ENDPOINTS.FACEBOOK_SCHEDULE}/${postId}`, {
        message,
        scheduledFor,
        timezone,
        link,
        imageUrl,
        requestor,
      });
      toast.success('Scheduled post updated.');
      return data;
    } catch (error) {
      toast.error(`Failed to update scheduled post: ${errorDetail(error)}`);
      throw error;
    }
  };
