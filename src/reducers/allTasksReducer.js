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
      return { ...allTasks, taskItems: sortByNum(action.taskItems), fetched: true, fetching: false, error: "none" }
    case types.ADD_NEW_TASK:
      action.newTask.new = true;
      allTasks.taskItems.push(action.newTask);
      return { ...allTasks, taskItems: sortByNum(allTasks.taskItems), fetched: true, fetching: false, error: "none" }
    case types.UPDATE_NUMS:
      allTasks.taskItems.forEach(task => {
        action.updatedList.forEach(updated => {
          if (task._id === updated.id) {
            task.num = updated.num;
            // level2
            allTasks.taskItems.forEach(childTask => {
              if (childTask.parentId === task._id) {
                childTask.num = childTask.num.replace(childTask.num.substring(0, task.num.length), task.num);
                // level 3
                allTasks.taskItems.forEach(childTask3 => {
                  if (childTask3.parentId === childTask._id) {
                    childTask3.num = childTask3.num.replace(childTask3.num.substring(0, childTask.num.length), childTask.num);
                    // level 4
                    allTasks.taskItems.forEach(childTask4 => {
                      if (childTask4.parentId === childTask3._id) {
                        childTask4.num = childTask4.num.replace(childTask4.num.substring(0, childTask3.num.length), childTask3.num);
                      }
                    })

                  }
                })
              }
            })
          }
        })
      });
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


  }
  return allTasks;
};
