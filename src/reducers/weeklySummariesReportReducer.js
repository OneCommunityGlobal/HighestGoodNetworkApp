import * as actions from '../constants/weeklySummariesReport';

const initialState = {
  summaries: [],
  loading: false,
  error: null,
};

// eslint-disable-next-line default-param-last
export const weeklySummariesReportReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.FETCH_SUMMARIES_REPORT_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actions.FETCH_SUMMARIES_REPORT_SUCCESS:
      // eslint-disable-next-line no-console
      // console.log(
      //   '🟢 Reducer received summaries:',
      //   (action.payload?.weeklySummariesData || []).map(u => ({
      //     id: u._id,
      //     name: `${u.firstName} ${u.lastName}`,
      //     filterColor: u.filterColor,
      //   })),
      // );
      // // eslint-disable-next-line no-console
      // // console.log('🔍 Cache keys being checked in getWeeklySummariesReport:');
      // // const cacheUtil = require('../utilities/nodeCache')();
      // // const allKeys = cacheUtil.keys();
      // // // eslint-disable-next-line no-console
      // // console.log('📋 All current cache keys:', allKeys);
      // return {
      //   ...state,
      //   loading: false,
      //   summaries: action.payload.weeklySummariesData,
      // };
      const fetchedSummaries = action.payload.weeklySummariesData;
      const mergedSummaries = fetchedSummaries.map(user => {
        const existing = state.summaries.find(s => s._id === user._id); //|| {};
        return {
          ...user,
          // filterColor: Array.isArray(user.filterColor)
          //   ? user.filterColor
          //   : existing.filterColor || [],
          filterColor: existing?.filterColor || user.filterColor,
        };
      });
      return { ...state, loading: false, summaries: mergedSummaries };

    case actions.FETCH_SUMMARIES_REPORT_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };

    case actions.UPDATE_SUMMARY_REPORT: {
      // Wrap this block in braces to fix the lexical declaration issue
      const { _id, updatedField } = action.payload;
      const newSummaries = [...state.summaries];
      const summaryIndex = newSummaries.findIndex(summary => summary._id === _id);
      if (summaryIndex === -1) return state; //updated
      newSummaries[summaryIndex] = { ...newSummaries[summaryIndex], ...updatedField }; //updated
      return {
        ...state,
        summaries: newSummaries,
      };
    }
    case actions.UPDATE_BULK_FILTER_COLORS: {
      const { color, teamCodes, newState } = action.payload;
      return {
        ...state,
        summaries: state.summaries.map(user =>
          teamCodes.includes(user.teamCode)
            ? { ...user, filterColor: newState ? [color] : [] }
            : user,
        ),
        bulkSelectedColors: {
          purple: false,
          green: false,
          navy: false,
          [color]: newState,
        },
      };
    }

    default:
      return state;
  }
};

export default weeklySummariesReportReducer;
