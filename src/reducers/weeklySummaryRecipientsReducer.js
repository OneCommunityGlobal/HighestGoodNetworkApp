import * as actions from '../constants/weeklySummariesReport';

const initialState = {
  user: {},
  recepientsArr: [],
  err: null,
};

// eslint-disable-next-line default-param-last
const weeklySummaryRecipientsReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.DELETE_WEEKLY_SUMMARIES_RECIPIENTS:
      return {
        ...state,
        recepientsArr: state.recepientsArr.filter(elem => elem._id !== action.payload.userid),
      };
    case actions.AUTHORIZE_WEEKLY_SUMMARY_REPORTS:
      return {
        ...state,
        passwordMatch: action.payload,
      };
    case actions.AUTHORIZE_WEEKLYSUMMARIES_REPORTS_ERROR:
      return {
        ...state,
        passwordMatchErr: action.payload,
      };
    case actions.GET_SUMMARY_RECIPIENTS:
      return {
        ...state,
        recepientsArr: action.recepientsArr,
      };
    case actions.GET_SUMMARY_RECIPIENTS_ERROR:
      return {
        ...state,
        getRecepientsErr: action.payload.err,
      };
    default:
      return state;
  }
};

export default weeklySummaryRecipientsReducer;
