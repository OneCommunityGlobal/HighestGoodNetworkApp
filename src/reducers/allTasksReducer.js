import * as types from './../constants/task'

const allTasksInital = {
  fetching: false,
  fetched: false,
  taskItems: [],
  error: ""
}


export const taskReducer = (allTasks = allTasksInital, action) => {
  switch (action.type) {
    case types.FETCH_TASKS_START:
      return { ...allTasks, fetched: false, fetching: true, error: "none" }
    case types.FETCH_TASKS_ERROR:
      return { ...allTasks, fetched: true, fetching: false, error: action.err }
    case types.RECEIVE_TASKS:

      action.taskItems.sort(function (a, b) {
        if (a.num < b.num) {
          return -1;
        }
        if (a.num > b.num) {
          return 1;
        }
        return 0;
      });

      return { ...allTasks, taskItems: action.taskItems, fetched: true, fetching: false, error: "none" }

  }
  return allTasks;
};
