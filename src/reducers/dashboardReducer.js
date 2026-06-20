import {
  INCREMENT_DASHBOARD_TASK_COUNT,
  UPDATE_SUMMARY_BAR_DATA,
} from '../actions/dashboardActions';

const initialState = {
  taskCounts: {},
  summaryBarData: {},
};

// eslint-disable-next-line default-param-last
const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case INCREMENT_DASHBOARD_TASK_COUNT: {
      // Wrap case block in braces to avoid scoping issues
      const { taskId } = action.payload;
      const previousCount = state.taskCounts[taskId] || 0;
      const newCount = previousCount + 1;
      return {
        ...state,
        taskCounts: {
          ...state.taskCounts,
          [taskId]: newCount,
        },
      };
    }
    case UPDATE_SUMMARY_BAR_DATA: {
      // Wrap case block in braces to avoid scoping issues
      const { summaryBarData } = action.payload;
      return {
        ...state,
        summaryBarData,
      };
    }
    default: {
      return state;
    }
  }
};

export default dashboardReducer;
