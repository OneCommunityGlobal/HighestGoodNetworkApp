import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';

import { ADD_EVENT_FEEDBACK } from "../../constants/communityPortal/eventFeedbackConstant";

export const addEventFeedback = (eventFeedback) => {
  return {
    type:ADD_EVENT_FEEDBACK,
    payload:eventFeedback
  }
}
/*
axios
      .post(ENDPOINTS.HGN_FORM_SUBMIT, groupedData)
      .then(res => {
        if (res.status === 201) toast.success('Form submitted successfully!');
      })
      .catch(error => {
        if (error.response.status === 500) toast.error('Error submitting form. Please try again.');
      });
    
*/
/* 
  try {
    await axios.post(ENDPOINTS.BADGE(), newBadge);
    dispatch(
      getMessage(
        'Awesomesauce! You have successfully uploaded a new badge to the system!',
        'success',
      ),
    );
    if (ALERT_DELAY === 0) {
      // test mode: fire immediately
      dispatch(closeAlert());
    } else {
      setTimeout(() => dispatch(closeAlert()), ALERT_DELAY);
    }
    dispatch(fetchAllBadges());
  } catch (e) {
    if (e.response.status === 403 || e.response.status === 400) {
      dispatch(getMessage(e.response.data.error, 'danger'));
      if (ALERT_DELAY === 0) {
        dispatch(closeAlert());
      } else {

        setTimeout(() => dispatch(closeAlert()), ALERT_DELAY);
      }
    } else {
      dispatch(getMessage('Oops, something is wrong!', 'danger'));
      if (ALERT_DELAY === 0) {
        dispatch(closeAlert());
      } else {
        setTimeout(() => dispatch(closeAlert()), ALERT_DELAY);
      }
    }
  }
};
*/