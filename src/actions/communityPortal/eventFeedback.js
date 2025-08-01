// export const ADD_EVENT_FEEDBACK = 'ADD_EVENT_FEEDBACK';
import { ADD_EVENT_FEEDBACK } from "../../constants/communityPortal/eventFeedbackConstant";

export const addEventFeedback = (eventFeedback) => {
  return {
    type:ADD_EVENT_FEEDBACK,
    payload:eventFeedback
  }
}
