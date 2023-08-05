import { createOrUpdateTaskNotificationHTTP } from 'actions/taskNotification';
import { fetchTeamMembersTaskSuccess } from 'components/TeamMemberTasks/actions';
import * as types from "../constants/task";

const allTasksInital = {
  fetching: false,
  fetched: false,
  fetchedData: [],
  taskItems: [],
  error: '',
  copiedTask: null,
};

const filterAndSort = (tasks, level) => {
  return tasks.sort((a, b) => {
    const aArr = a.num.split('.');
    const bArr = b.num.split('.');
    for (let i = 0; i < level; i++) {
      if (+aArr[i] !== +bArr[i]) return +aArr[i] - +bArr[i];
    }
    return 0;
  });
};

const sortByNum = tasks => {
  const appendTasks = tasks.map(task => {
    /** Based on my observation, previous addTask functionality is not working properly,
     * the created new task does not change its parent task property 'hasChild' from default false to true,
     * so below are the temporary fix to create a 'hasChildren' property to represent the actual 'hasChild' value
     * this should be fixed by future PR. --- PR#934
     */
    const hasChildren = tasks.some(item => item.mother === task._id);

    /** task.num from response data has different form for different level:
     *    level 1: x
     *    level 2: x.x
     *    level 3: x.x.x
     *  below is trying to make sure the num property in state is in the same form of x.x.x.x,
     * */
    const numOfNums = task.num.split('.').length;
    const num = task.num.concat('.0'.repeat(4 - numOfNums));

    return { ...task, num, hasChildren };
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
      /** commemt out old code for future reference (mother parameter) --- PR#934 */
      // if (action.level === -1) {
      //   return { ...allTasks, taskItems: [], fetched: true, fetching: false, error: 'none' };
      // } else if (action.level === 0) {
      //   return {
      //     ...allTasks,
      //     taskItems: [...sortByNum(action.taskItems)],
      //     fetched: true,
      //     fetching: false,
      //     error: 'none',
      //   };
      // } else {
      //   const motherIndex = allTasks.taskItems.findIndex(item => item._id === action.mother);
      //   return {
      //     ...allTasks,
      //     taskItems: [
      //       ...allTasks.taskItems.slice(0, motherIndex + 1),
      //       ...sortByNum(action.taskItems),
      //       ...allTasks.taskItems.slice(motherIndex + 1),
      //     ],
      //     fetched: true,
      //     fetching: false,
      //     error: 'none',
      //   };
      if (action.level === -1) {
        return {
          ...allTasks,
          taskItems: [],
          fetchedData: [],
          fetched: true,
          fetching: false,
          error: 'none',
        };
      } else {
        allTasks.fetchedData[action.level] = action.taskItems;
        const newTaskItems = allTasks.fetchedData.flat();
        return {
          ...allTasks,
          fetchedData: [...allTasks.fetchedData],
          taskItems: sortByNum(newTaskItems),
          fetched: true,
          fetching: false,
          error: 'none',
        };
      }
    case types.ADD_NEW_TASK:
      const newTaskItems = [action.newTask, ...allTasks.taskItems];
      return {
        ...allTasks,
        taskItems: sortByNum(newTaskItems),
        fetched: true,
        fetching: false,
        error: 'none',
      };
    case types.DELETE_TASK:
      const delIndexStart = allTasks.taskItems.findIndex(task => task._id === action.taskId);
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
        fetchedData: [],
        taskItems: [],
      };
    case types.UPDATE_TASK:
      const updIndexStart = allTasks.taskItems.findIndex(task => task._id === action.taskId);
      const updIndexEnd = updIndexStart;
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