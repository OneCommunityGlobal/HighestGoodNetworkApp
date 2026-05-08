import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { toast } from 'react-toastify';

export const createEvent = eventData => {
  return async dispatch => {
    try {
      const res = await axios.post(ENDPOINTS.EVENTS, eventData);
      if (res.status === 201) {
        toast.success('Event created successfully!');
        return { success: true, event: res.data };
      }
      return { success: false, error: 'Unexpected response status' };
    } catch (error) {
      if (error.response?.status === 500) {
        toast.error('Error creating event. Please try again.');
      } else if (error.response?.status === 404 || error.response?.status === 403 || error.response?.status === 400) {
        toast.error('Permission or Validation Error. Please check your input or access rights');
      } else {
        toast.error('Error creating event. Please try again.');
      }
      return { success: false, error: error.response?.data || error.message };
    }
  };
};

