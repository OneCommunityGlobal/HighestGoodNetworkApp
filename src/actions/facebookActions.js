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
