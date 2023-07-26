/*********************************************************************************
 * Action: Tasks
 * Author: Henry Ng - 03/20/20
 ********************************************************************************/
import axios from 'axios';
import {
  fetchTeamMembersTaskSuccess,
  fetchTeamMembersTaskBegin,
  fetchTeamMembersTaskError,
} from 'components/TeamMemberTasks/actions';
import * as types from '../constants/task';
import { ENDPOINTS } from '../utils/URL';
import { createOrUpdateTaskNotificationHTTP } from './taskNotification';
import { createTaskEditSuggestionHTTP } from 'components/TaskEditSuggestions/service';

const selectFetchTeamMembersTaskData = state => state.auth.user.userid;
const selectUserId = state => state.auth.user.userid;
const selectUpdateTaskData = (state, taskId) =>
  state.tasks.taskItems.find(({ _id }) => _id === taskId);

//for those who are not familiarized, this is a arrow function inside a arrow function.
// It's the same as doing function(currentUserId){async function(dispatch, getState)}
//Because of the closure, the inside function have access the currentUserId, that it uses and provides to the userId
//I've also added authentiatedUserId param so, if you are seeing another user's dashboard, it can fetch the authenticated user tasks to make a filter when seeing an owner or another user
export const fetchTeamMembersTask = (currentUserId, authenticatedUserId, shouldReload = true) => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    //The userId will be equal the currentUserId if provided, if not, it'll call the selectFetchTeamMembersTaskData, that will return the current user id that's on the store

    const userId = currentUserId ? currentUserId : selectFetchTeamMembersTaskData(state);
    const authUserId = authenticatedUserId ? authenticatedUserId : null

    if(shouldReload){
      await dispatch(fetchTeamMembersTaskBegin());
    }

    const response = await axios.get(ENDPOINTS.TEAM_MEMBER_TASKS(userId));


    //if you are seeing another user's dashboard, the authenticated user id will be provided so the filter can be made
    if (authUserId !== null) {
      const originalTasks = await axios.get(ENDPOINTS.TEAM_MEMBER_TASKS(authUserId));
      const authUserTasks = originalTasks.data
      const userTasks = response.data
      const correctedTasks = userTasks.filter(task => {
        return authUserTasks.some(task2 => task2.personId === task.personId)
      });
      await dispatch(fetchTeamMembersTaskSuccess(correctedTasks));
    } else {
      await dispatch(fetchTeamMembersTaskSuccess(response.data));
    }
  } catch (error) {

    await dispatch(fetchTeamMembersTaskError());
  }
};

// TODO: TeamMemberTasks.jsx dispatch
export const deleteTaskNotification = (userId, taskId, taskNotificationId) => async (
  dispatch,
  getState,
) => {
  try {
    //dispatch(deleteTaskNotificationBegin());
    const res = await axios.delete(ENDPOINTS.DELETE_TASK_NOTIFICATION(taskNotificationId));
    dispatch(deleteTaskNotificationSuccess({ userId, taskId, taskNotificationId }));
  } catch (error) {
    //dispatch(deleteTaskNotificationError());
  }
};
export const deleteChildrenTasks = taskId => async (dispatch, getState) => {
  let status = 200;
  try {
    await axios.post(ENDPOINTS.DELETE_CHILDREN(taskId));
  } catch (error) {
    console.log(error);
  }
};

export const addNewTask = (newTask, wbsId) => async (dispatch, getState) => {
  let status = 200;
  let _id = null;
  let task = {};
  try {
    //dispatch(fetchTeamMembersTaskBegin());
    const res = await axios.post(ENDPOINTS.TASK(wbsId), newTask);
    _id = res.data._id;
    status = res.status;
    task = res.data;
    const userIds = task.resources.map(resource => resource.userID);
    await createOrUpdateTaskNotificationHTTP(task._id, {}, userIds);
  } catch (error) {
    //dispatch(fetchTeamMembersTaskError());
    status = 400;
  }
  newTask._id = _id;
  await dispatch(postNewTask(task, status));
};

export const updateTask = (taskId, updatedTask, hasPermission) => async (dispatch, getState) => {
  let status = 200;
  try {
    const state = getState();
    const oldTask = selectUpdateTaskData(state, taskId);
    //dispatch(fetchTeamMembersTaskBegin());
    if (hasPermission) {
      await axios.put(ENDPOINTS.TASK_UPDATE(taskId), updatedTask);
      const userIds = updatedTask.resources.map(resource => resource.userID);
      await createOrUpdateTaskNotificationHTTP(taskId, oldTask, userIds);
    } else {
      await createTaskEditSuggestionHTTP(taskId, selectUserId(state), oldTask, updatedTask);
    }
  } catch (error) {
    //dispatch(fetchTeamMembersTaskError());
    console.log(error);
    status = 400;
  }
  // TODO: DISPATCH TO TASKEDITSUGGESETIONS REDUCER TO UPDATE STATE
  await dispatch(putUpdatedTask(updatedTask, taskId, status));
};

export const importTask = (newTask, wbsId) => {
  const url = ENDPOINTS.TASK_IMPORT(wbsId);
  return async dispatch => {
    let status = 200;
    let _id = null;
    let task = {};

    try {
      const res = await axios.post(url, { list: newTask });
      _id = res.data._id;
      status = res.status;
      task = res.data;
    } catch (err) {
      console.log('TRY CATCH ERR', err);
      status = 400;
    }

    newTask._id = _id;

    /*await dispatch(
      postNewTask(task,
        status
      ));*/
  };
};

export const updateNumList = (wbsId, list) => {
  const url = ENDPOINTS.TASKS_UPDATE + '/num';
  return async dispatch => {
    let status = 200;
    try {
      const res = await axios.put(url, { wbsId, nums: list });
      status = res.status;
    } catch (err) {
      status = 400;
    }
    await dispatch(updateNums(list));
  };
};

export const moveTasks = (wbsId, fromNum, toNum) => {
  const url = ENDPOINTS.MOVE_TASKS(wbsId);
  return async dispatch => {
    try {
      const res = await axios.put(url, { fromNum, toNum });
    } catch (err) {}
    dispatch(setTasksError());
  };
};

export const fetchAllTasks = (wbsId, level = 0, mother = null) => {
  return async dispatch => {
    await dispatch(setTasksStart());
    try {
      const request = await axios.get(ENDPOINTS.TASKS(wbsId, level === -1 ? 1 : level + 1, mother));
      dispatch(setTasks(request.data, level, mother));
    } catch (err) {
      dispatch(setTasksError(err));
    }
  };
};

export const emptyAllTaskItems = () => {
  return async dispatch => {
    dispatch(emptyTaskItems());
  }
}

export const deleteTask = (taskId, mother) => {
  const url = ENDPOINTS.TASK_DEL(taskId, mother);
  return async dispatch => {
    let status = 200;
    try {
      const res = await axios.post(url);
      status = res.status;
    } catch (err) {
      status = 400;
    }
    await dispatch(removeTask(taskId, status));
  };
};

export const copyTask = taskId => {
  return async dispatch => {
    await dispatch(saveTmpTask(taskId));
  };
};

/**
 * Set a flag that fetching Task
 */
export const setTasksStart = () => {
  return {
    type: types.FETCH_TASKS_START,
  };
};

/**
 * set Task in store
 * @param payload : Task []
 */
export const setTasks = (taskItems, level, mother) => {
  return {
    type: types.RECEIVE_TASKS,
    taskItems,
    level,
    mother,
  };
};

export const emptyTaskItems = () => {
  return {
    type: types.EMPTY_TASK_ITEMS,
  };
};

/**
 * Error when setting project
 * @param payload : error status code
 */
export const setTasksError = err => {
  return {
    type: types.FETCH_TASKS_ERROR,
    err,
  };
};

export const postNewTask = (newTask, status) => {
  return {
    type: types.ADD_NEW_TASK,
    newTask,
    status,
  };
};

export const putUpdatedTask = (updatedTask, taskId, status) => {
  return {
    type: types.UPDATE_TASK,
    updatedTask,
    taskId,
    status,
  };
};

export const swapTasks = (tasks, status) => {
  return {
    type: types.SWAP_TASKS,
    tasks,
    status,
  };
};

export const updateNums = updatedList => {
  console.log('updated list', updatedList);
  return {
    type: types.UPDATE_NUMS,
    updatedList,
  };
};

export const removeTask = (taskId, status) => {
  return {
    type: types.DELETE_TASK,
    taskId,
    status,
  };
};

export const saveTmpTask = taskId => {
  return {
    type: types.COPY_TASK,
    taskId,
  };
};
