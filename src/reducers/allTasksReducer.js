import { createOrUpdateTaskNotificationHTTP } from 'actions/taskNotification';
import { fetchTeamMembersTaskSuccess } from 'components/TeamMemberTasks/actions';
import * as types from './../constants/task';

const allTasksInital = {
  fetching: false,
  fetched: false,
  taskItems: [],
  error: '',
  copiedTask: null,
};

const filterAndSort = (tasks, level) => {
  return tasks.sort((a, b) => {
    const aArr = a.num.split('.');
    const bArr = b.num.split('.');
    for (let i = 0; i < level; i++) {
      if (parseInt(aArr[i]) < parseInt(bArr[i])) {
        return -1;
      }
      if (parseInt(aArr[i]) > parseInt(bArr[i])) {
        return 1;
      }
    }
    return 0;
  });
};

const sortByNum = tasks => {
  const appendTasks = [];

  tasks.forEach((task, i) => {
    let numChildren = tasks.filter(item => item.mother === task.taskId).length;
    if (numChildren > 0) {
      task.hasChildren = true;
    } else {
      task.hasChildren = false;
    }
    if (task.level === 1) {
      task.num += '.0.0.0';
    }
    if (task.level === 2) {
      task.num += '.0.0';
    }
    if (task.level === 3) {
      task.num += '.0';
    }

    appendTasks.push(task);
  });

  return filterAndSort(appendTasks, 4);
};

export const taskReducer = (allTasks = allTasksInital, action) => {
  switch (action.type) {
    case types.FETCH_TASKS_START:
      return { ...allTasks, fetched: false, fetching: true, error: 'none' };
    case types.FETCH_TASKS_ERROR:
      return { ...allTasks, fetched: true, fetching: false, error: action.err };
    case types.RECEIVE_TASKS:
      if (action.level === -1) {
        return { ...allTasks, taskItems: [], fetched: true, fetching: false, error: 'none' };
      } else if (action.level === 0) {
        return {
          ...allTasks,
          taskItems: [...sortByNum(action.taskItems)],
          fetched: true,
          fetching: false,
          error: 'none',
        };
      } else {
        const motherIndex = allTasks.taskItems.findIndex(item => item._id === action.mother);
        return {
          ...allTasks,
          taskItems: [
            ...allTasks.taskItems.slice(0, motherIndex + 1),
            ...sortByNum(action.taskItems),
            ...allTasks.taskItems.slice(motherIndex + 1),
          ],
          fetched: true,
          fetching: false,
          error: 'none',
        };
      }
    case types.ADD_NEW_TASK:
      const motherIndex = allTasks.taskItems.findIndex(item => item._id === action.newTask.mother);
      const index = motherIndex + 1;
      return {
        ...allTasks,
        taskItems: [
          ...allTasks.taskItems.slice(0, index),
          ...sortByNum([action.newTask, ...allTasks.taskItems.slice(index)]),
        ],
        fetched: true,
        fetching: false,
        error: 'none',
      };
    case types.DELETE_TASK:
      let delIndexStart = allTasks.taskItems.findIndex(task => task._id === action.taskId);
      let delIndexEnd = delIndexStart;
      allTasks.taskItems.forEach((task, index) => {
        if (task.parentId3 === action.taskId) {
          delIndexEnd = index;
        }
        if (task.parentId2 === action.taskId) {
          delIndexEnd = index;
        }
        if (task.parentId1 === action.taskId) {
          delIndexEnd = index;
        }
      });
      return {
        ...allTasks,
        taskItems: [
          ...allTasks.taskItems.slice(0, delIndexStart),
          ...allTasks.taskItems.slice(delIndexEnd + 1),
        ],
        fetched: true,
        fetching: false,
        error: 'none',
      };
    case types.EMPTY_TASK_ITEMS:
      return {
        ...allTasks,
        taskItems: []
      };
    case types.UPDATE_TASK:
      let updIndexStart = allTasks.taskItems.findIndex(task => task._id === action.taskId);
      let updIndexEnd = updIndexStart;
      let updatedTask = allTasks.taskItems.filter(task => task._id === action.taskId)[0];
      updatedTask = { ...updatedTask, ...action.updatedTask };
      return {
        ...allTasks,
        taskItems: [
          ...allTasks.taskItems.slice(0, updIndexStart),
          updatedTask,
          ...allTasks.taskItems.slice(updIndexEnd + 1),
        ],
        fetched: true,
        fetching: false,
        error: 'none',
      };
    case types.COPY_TASK:
      const copiedIndex = allTasks.taskItems.findIndex(item => item._id === action.taskId);
      console.log(allTasks.taskItems[copiedIndex]);
      return { ...allTasks, copiedTask: allTasks.taskItems[copiedIndex] };
    case fetchTeamMembersTaskSuccess.type:
      return { ...allTasks, ...action.tasks }; // change that when there will be backend
    default:
      return allTasks;
  }
};
