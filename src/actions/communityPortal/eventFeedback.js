import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import {toast} from 'react-toastify';
import { ADD_EVENT_FEEDBACK } from "../../constants/communityPortal/eventFeedbackConstant";

export const addEventFeedback = (eventFeedback) => {
  return async dispatch => {
    try {
      const res = await axios
      .post(ENDPOINTS.CP_ADD_EVENT_FEEDBACK, eventFeedback);
       if (res.status === 201) 
        toast.success('Event Feedback submitted successfully!');
        dispatch ({
    type:ADD_EVENT_FEEDBACK,
    payload:eventFeedback
  });
      }
      catch(error) {
        if (error.response.status === 500)
          toast.error('Error submitting Event Feedback. Please try again.');
        else if (error.response.status === 404 ||error.response.status === 403 || error.response.status === 400)
        toast.error('Permission or Validation Error. Please check your input or access rights');
        else {
        toast.error('Error submitting Event Feedback. Please try again.');
        }
      };

    }
  
}
