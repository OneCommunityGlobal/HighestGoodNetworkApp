import { fetchTeamMembersTaskSuccess } from 'components/TeamMemberTasks/actions';
import * as types from '../constants/task';

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
    for (let i = 0; i < level; i += 1) {
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
    const hasChildren = tasks.some(item => item?.mother === task._id);

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

// eslint-disable-next-line default-param-last
export const taskReducer = (allTasks = allTasksInital, action) => {
  switch (action.type) {
    case types.FETCH_TASKS_START: {
      return { ...allTasks, fetched: false, fetching: true, error: 'none' };
    }

    case types.FETCH_TASKS_ERROR: {
      return { ...allTasks, fetched: true, fetching: false, error: action.err };
    }

    case types.RECEIVE_TASKS: {
      const updatedFetchedData = [...allTasks.fetchedData];
      updatedFetchedData[action.level] = action.taskItems;

      const newTaskItems = updatedFetchedData.flat();
      return {
        ...allTasks,
        fetchedData: updatedFetchedData,
        taskItems: sortByNum(newTaskItems),
        fetched: true,
        fetching: false,
        error: 'none',
      };
    }

    case types.ADD_NEW_TASK: {
      const newTaskItems = [action.newTask, ...allTasks.taskItems];
      return {
        ...allTasks,
        taskItems: sortByNum(newTaskItems),
        fetched: true,
        fetching: false,
        error: 'none',
      };
    }

    case types.DELETE_TASK: {
      const startIndex = allTasks.taskItems.findIndex(task => task._id === action.taskId);
      const endIndex = allTasks.taskItems.reduce((lastIndex, task, index) => {
        if (
          task.parentId1 === action.taskId ||
          task.parentId2 === action.taskId ||
          task.parentId3 === action.taskId
        ) {
          return index;
        }
        return lastIndex;
      }, startIndex);

      const updatedTasks = [
        ...allTasks.taskItems.slice(0, startIndex),
        ...allTasks.taskItems.slice(endIndex + 1),
      ];

      return {
        ...allTasks,
        taskItems: updatedTasks,
        fetched: true,
        fetching: false,
        error: 'none',
      };
    }

    case types.EMPTY_TASK_ITEMS: {
      return {
        ...allTasks,
        taskItems: [],
        fetchedData: [],
        fetched: true,
        fetching: false,
        error: 'none',
      };
    }

    case types.UPDATE_TASK: {
      const updatedTasks = allTasks.taskItems.map(task =>
        task._id === action.taskId ? { ...task, ...action.updatedTask } : task,
      );

      return {
        ...allTasks,
        taskItems: updatedTasks,
        fetched: true,
        fetching: false,
        error: 'none',
      };
    }

    case types.COPY_TASK: {
      const copiedTask = allTasks.taskItems.find(task => task._id === action.taskId);
      copiedTask.resources = copiedTask?.resources?.map(resource => {
        const { completedTask, ...otherDetails } = resource;
        // Exclude the "completedTask" status to ensure tasks created by pasting are displayed.
        return otherDetails;
      });
      return { ...allTasks, copiedTask };
    }

    case types.ADD_NEW_TASK_ERROR: {
      return { ...allTasks, error: action.err };
    }

    case fetchTeamMembersTaskSuccess.type: {
      return { ...allTasks, ...action.tasks }; // Placeholder for backend integration
    }

    default: {
      return allTasks;
    }
  }
};

export default taskReducer;
