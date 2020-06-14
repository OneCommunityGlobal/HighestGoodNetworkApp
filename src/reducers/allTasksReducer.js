import * as types from './../constants/task'

const allTasksInital = {
  fetching: false,
  fetched: false,
  taskItems: [],
  error: ""
}

const sortByNum = (tasks) => {
  tasks.sort(function (a, b) {
    if (a.num < b.num) {
      return -1;
    }
    if (a.num > b.num) {
      return 1;
    }
    return 0;
  });

  return tasks;
}


export const taskReducer = (allTasks = allTasksInital, action) => {
  switch (action.type) {
    case types.FETCH_TASKS_START:
      return { ...allTasks, fetched: false, fetching: true, error: "none" }
    case types.FETCH_TASKS_ERROR:
      return { ...allTasks, fetched: true, fetching: false, error: action.err }
    case types.RECEIVE_TASKS:
      return { ...allTasks, taskItems: [...sortByNum(action.taskItems)], fetched: true, fetching: false, error: "none" }
    case types.ADD_NEW_TASK:
      action.newTask.new = true;
      allTasks.taskItems.push(action.newTask);
      return { ...allTasks, taskItems: sortByNum(allTasks.taskItems), fetched: true, fetching: false, error: "none" }
    case types.DELETE_TASK:
      let indexStart = allTasks.taskItems.findIndex(task => task._id == action.taskId);
      let indexEnd = indexStart;
      allTasks.taskItems.forEach((task, index) => {
        if (task.parentId3 === action.taskId) {
          indexEnd = index;
        }
        if (task.parentId2 === action.taskId) {
          indexEnd = index;
        }
        if (task.parentId1 === action.taskId) {
          indexEnd = index;
        }
      });
      return { ...allTasks, taskItems: [...allTasks.taskItems.slice(0, indexStart), ...allTasks.taskItems.slice(indexEnd + 1)], fetched: true, fetching: false, error: "none" }
    case types.UPDATE_TASK:

      indexStart = allTasks.taskItems.findIndex(task => task._id == action.taskId);
      indexEnd = indexStart;
      let updatedTask = allTasks.taskItems.filter(task => task._id === action.taskId)[0];
      updatedTask = { ...updatedTask, ...action.updatedTask };
      return { ...allTasks, taskItems: [...allTasks.taskItems.slice(0, indexStart), updatedTask, ...allTasks.taskItems.slice(indexEnd + 1)], fetched: true, fetching: false, error: "none" }

  }
  return allTasks;
};
