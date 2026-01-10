import { fetchTeamMembersTaskSuccess } from '~/components/TeamMemberTasks/actions';
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
    const hasChildren = tasks.some(item => item?.mother === task._id);
    const numOfNums = task.num.split('.').length;
    const num = task.num.concat('.0'.repeat(4 - numOfNums));
    return { ...task, num, hasChildren };
  });
  return filterAndSort(appendTasks, 4);
};

// eslint-disable-next-line default-param-last
export const taskReducer = (rawState = allTasksInital, action) => {
  const allTasks = { ...allTasksInital, ...rawState };
  switch (action.type) {
    case types.FETCH_TASKS_START:
      return { ...allTasks, fetched: false, fetching: true, error: 'none' };

    case types.FETCH_TASKS_ERROR:
      return { ...allTasks, fetched: true, fetching: false, error: action.err };

    case types.RECEIVE_TASKS: {
      // Clear when level < 0
      if (typeof action.level === 'number' && action.level < 0) {
        return {
          ...allTasks,
          fetchedData: [],
          taskItems: [],
          fetched: true,
          fetching: false,
          error: 'none',
        };
      }
      // Nested insertion (mother)
      if (action.mother != null) {
        const existing = allTasks.taskItems.slice();
        const allNums = existing.map(t => t.num).concat(action.taskItems.map(t => t.num));
        const maxDepth = allNums.reduce((m, n) => Math.max(m, n.split('.').length), 0);
        const kids = action.taskItems
          .slice()
          .sort((a, b) => a.num.localeCompare(b.num, undefined, { numeric: true }))
          .map(child => {
            const missing = maxDepth + 1 - child.num.split('.').length;
            return {
              ...child,
              num: child.num + '.0'.repeat(missing),
              hasChildren: false,
            };
          });
        const updatedRoots = existing.map(t =>
          t.taskId === action.mother ? { ...t, hasChildren: true } : t,
        );
        const idx = updatedRoots.findIndex(t => t.taskId === action.mother);
        const newList = [
          ...updatedRoots.slice(0, idx + 1),
          ...kids,
          ...updatedRoots.slice(idx + 1),
        ];
        return {
          ...allTasks,
          taskItems: newList,
          fetched: true,
          fetching: false,
          error: 'none',
        };
      }
      // Top-level flatten + numeric sort
      const updatedFetchedData = [...allTasks.fetchedData];
      updatedFetchedData[action.level] = action.taskItems || [];
      const flat = updatedFetchedData.flat();
      flat.sort((a, b) => a.num.localeCompare(b.num, undefined, { numeric: true }));
      return {
        ...allTasks,
        fetchedData: updatedFetchedData,
        taskItems: flat,
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

    case types.EMPTY_TASK_ITEMS:
      return {
        ...allTasks,
        taskItems: [],
        fetchedData: [],
        fetched: true,
        fetching: false,
        error: 'none',
      };

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
      if (copiedTask) {
        copiedTask.resources = copiedTask.resources?.map(resource => {
          const { completedTask, ...otherDetails } = resource;
          return otherDetails;
        });
      }
      return { ...allTasks, copiedTask };
    }

    case types.ADD_NEW_TASK_ERROR:
      return { ...allTasks, error: action.err };

    case fetchTeamMembersTaskSuccess.type:
      return { ...allTasks, ...action.tasks };

    default:
      return allTasks;
  }
};

export default taskReducer;
