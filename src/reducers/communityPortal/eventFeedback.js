import { ADD_EVENT_FEEDBACK } from '../../constants/communityPortal/eventFeedbackConstant';

const initialState = {
  eventFeedback: [],
};

// eslint-disable-next-line default-param-last
export const eventFeedbackReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_EVENT_FEEDBACK:
      return {
        ...state,
        eventFeedback: [...state.eventFeedback, action.payload],
      };
    default:
      return state;
  }
};
export default eventFeedbackReducer;
