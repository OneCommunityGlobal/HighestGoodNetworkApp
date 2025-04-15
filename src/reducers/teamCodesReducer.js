import { SET_TEAM_CODES } from '../actions/teamCodes';

const initialState = {
  teamCodes: [],
};

// eslint-disable-next-line default-param-last
const teamCodesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TEAM_CODES:
      return {
        ...state,
        teamCodes: action.payload,
      };
    default:
      return state;
  }
};

export default teamCodesReducer;
