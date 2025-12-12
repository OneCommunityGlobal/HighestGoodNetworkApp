import * as types from '../constants/studentTasks';

const initialState = {
  taskItems: [],
  fetched: false,
  fetching: false,
  error: 'none',
};

export const studentTasksReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_STUDENT_TASKS_START:
      return {
        ...state,
        fetched: false,
        fetching: true,
        error: 'none',
      };

    case types.FETCH_STUDENT_TASKS_ERROR:
      return {
        ...state,
        fetched: true,
        fetching: false,
        error: action.err,
      };

    case types.RECEIVE_STUDENT_TASKS:
      return {
        ...state,
        taskItems: action.taskItems || [],
        fetched: true,
        fetching: false,
        error: 'none',
      };

    case types.UPDATE_STUDENT_TASK:
      return {
        ...state,
        taskItems: state.taskItems.map(task =>
          task.id === action.taskId ? { ...task, ...action.updatedTask } : task,
        ),
      };

    default:
      return state;
  }
};
