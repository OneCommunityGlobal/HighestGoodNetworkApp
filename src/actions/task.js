/* eslint-disable no-param-reassign */
/** *******************************************************************************
 * Action: Tasks
 * Author: Henry Ng - 03/20/20
 ******************************************************************************* */
import axios from 'axios';
import { createTaskEditSuggestionHTTP } from '../components/TaskEditSuggestions/service';
import {
  fetchTeamMembersTaskSuccess,
  fetchTeamMembersTaskBegin,
  fetchTeamMembersTaskError,
} from '../components/TeamMemberTasks/actions';
import * as types from '../constants/task';
import { ENDPOINTS } from '../utils/URL';
import { createOrUpdateTaskNotificationHTTP } from './taskNotification';

const selectFetchTeamMembersTaskData = (state) => state.auth.user.userid;
const selectUserId = (state) => state.auth.user.userid;
const selectUpdateTaskData = (state, taskId) =>
  state.tasks.taskItems.find(({ _id }) => _id === taskId);

export const postNewTask = (newTask, status) => ({
  type: types.ADD_NEW_TASK,
  newTask,
  status,
});

export const addNewTask = (newTask, wbsId) => async (dispatch) => {
  let status = 200;
  let _id = null;
  let task = {};
  try {
    // dispatch(fetchTeamMembersTaskBegin());
    const res = await axios.post(ENDPOINTS.TASK(wbsId), newTask);
    _id = res.data._id;
    status = res.status;
    task = res.data;
    const userIds = task.resources.map((resource) => resource.userID);
    await createOrUpdateTaskNotificationHTTP(task._id, {}, userIds);
  } catch (error) {
    // dispatch(fetchTeamMembersTaskError());
    status = 400;
  }
  newTask._id = _id;
  await dispatch(postNewTask(task, status));
};

export const putUpdatedTask = (updatedTask, taskId, status) => ({
  type: types.UPDATE_TASK,
  updatedTask,
  taskId,
  status,
});

export const updateTask = (taskId, updatedTask, hasPermission) => async (dispatch, getState) => {
  let status = 200;
  try {
    const state = getState();
    const oldTask = selectUpdateTaskData(state, taskId);
    // dispatch(fetchTeamMembersTaskBegin());
    if (hasPermission) {
      await axios.put(ENDPOINTS.TASK_UPDATE(taskId), updatedTask);
      const userIds = updatedTask.resources.map((resource) => resource.userID);
      await createOrUpdateTaskNotificationHTTP(taskId, oldTask, userIds);
    } else {
      await createTaskEditSuggestionHTTP(taskId, selectUserId(state), oldTask, updatedTask);
    }
  } catch (error) {
    // dispatch(fetchTeamMembersTaskError());
    status = 400;
  }
  // TODO: DISPATCH TO TASKEDITSUGGESETIONS REDUCER TO UPDATE STATE
  await dispatch(putUpdatedTask(updatedTask, taskId, status));
};

export const importTask = (newTask, wbsId) => {
  const url = ENDPOINTS.TASK_IMPORT(wbsId);
  return async (dispatch) => {
    const status = 200;
    let _id = null;
    const task = {};

    try {
      const res = await axios.post(url, { list: newTask });
      _id = res.data._id;
    } catch (err) {
      return err;
    }

    newTask._id = _id;

    /* await dispatch(
        postNewTask(task,
          status
        )); */
  };
};

export const updateNumList = (wbsId, list) => {
  const url = `${ENDPOINTS.TASKS_UPDATE}/num`;
  return async (dispatch) => {
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
  return async (dispatch) => {
    try {
      const res = await axios.put(url, { fromNum, toNum });
    } catch (err) {}
    dispatch(setTasksError());
  };
};

export const fetchAllTasks = (wbsId, level = 0, mother = null) => async (dispatch) => {
  await dispatch(setTasksStart());
  try {
    const request = await axios.get(ENDPOINTS.TASKS(wbsId, level === -1 ? 1 : level + 1, mother));
    // console.log(request.data);
    dispatch(setTasks(request.data, level, mother));
  } catch (err) {
    dispatch(setTasksError(err));
  }
};

export const deleteTask = (taskId, mother) => {
  const url = ENDPOINTS.TASK_DEL(taskId, mother);
  return async (dispatch) => {
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

export const copyTask = (taskId) => async (dispatch) => {
  await dispatch(saveTmpTask(taskId));
};

/**
 * Set a flag that fetching Task
 */
export const setTasksStart = () => ({
  type: types.FETCH_TASKS_START,
});

/**
 * set Task in store
 * @param payload : Task []
 */
export const setTasks = (taskItems, level, mother) => ({
  type: types.RECEIVE_TASKS,
  taskItems,
  level,
  mother,
});

/**
 * Error when setting project
 * @param payload : error status code
 */
export const setTasksError = (err) => ({
  type: types.FETCH_TASKS_ERROR,
  err,
});

export const swapTasks = (tasks, status) => ({
  type: types.SWAP_TASKS,
  tasks,
  status,
});

export const updateNums = (updatedList) => {
  console.log('updated list', updatedList);
  return {
    type: types.UPDATE_NUMS,
    updatedList,
  };
};

export const removeTask = (taskId, status) => ({
  type: types.DELETE_TASK,
  taskId,
  status,
});

export const saveTmpTask = (taskId) => ({
  type: types.COPY_TASK,
  taskId,
});

export const fetchTeamMembersTask = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const userId = selectFetchTeamMembersTaskData(state);
    dispatch(fetchTeamMembersTaskBegin());
    const response = await axios.get(ENDPOINTS.TEAM_MEMBER_TASKS(userId));
    dispatch(fetchTeamMembersTaskSuccess(response.data));
  } catch (error) {
    dispatch(fetchTeamMembersTaskError());
  }
};

// TODO: TeamMemberTasks.jsx dispatch
export const deleteTaskNotification = (userId, taskId, taskNotificationId) => async (
  dispatch,
  getState,
) => {
  try {
    // dispatch(deleteTaskNotificationBegin());
    const res = await axios.delete(ENDPOINTS.DELETE_TASK_NOTIFICATION(taskNotificationId));
    dispatch(deleteTaskNotificationSuccess({ userId, taskId, taskNotificationId }));
  } catch (error) {
    // dispatch(deleteTaskNotificationError());
  }
};
