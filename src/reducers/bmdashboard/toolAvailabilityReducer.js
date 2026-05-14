import { GET_TOOL_AVAILABILITY } from '../../constants/bmdashboard/toolsConstants';

const defaultState = {
  availabilityData: null,
};
// eslint-disable-next-line default-param-last
const toolAvailabilityReducer = (state = defaultState, action) => {
  switch (action.type) {
    case GET_TOOL_AVAILABILITY:
      return {
        ...state,
        availabilityData: action.payload,
      };
    default:
      return state;
  }
};

export default toolAvailabilityReducer;
