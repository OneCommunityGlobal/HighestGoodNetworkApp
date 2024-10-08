import { INCREMENT_DASHBOARD_TASK_COUNT } from '../actions/dashboardActions';

const initialState = {
  taskCounts: {},
};

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case INCREMENT_DASHBOARD_TASK_COUNT:
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
    default:
      return state;
  }
};

export default dashboardReducer;