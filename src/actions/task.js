/*********************************************************************************
 * Action: Tasks
 * Author: Henry Ng - 03/20/20
 ********************************************************************************/
import axios from 'axios';
import * as types from '../constants/task';
import { ENDPOINTS } from '../utils/URL';

export const importTask = (newTask, wbsId) => {
  const url = ENDPOINTS.TASK_IMPORT(wbsId);
  return async (dispatch) => {
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

export const addNewTask = (newTask, wbsId) => {
  const url = ENDPOINTS.TASK(wbsId);
  return async (dispatch) => {
    let status = 200;
    let _id = null;
    let task = {};

    try {
      const res = await axios.post(url, newTask);
      _id = res.data._id;
      status = res.status;
      task = res.data;
    } catch (err) {
      status = 400;
    }

    newTask._id = _id;
    await dispatch(postNewTask(task, status));
  };
};

export const updateNumList = (wbsId, list) => {
  const url = ENDPOINTS.TASKS_UPDATE + '/num';
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

export const fetchAllTasks = (wbsId, level = 0, mother = null) => {
  return async (dispatch) => {
    await dispatch(setTasksStart());
    try {
      const request = await axios.get(ENDPOINTS.TASKS(wbsId, level === -1 ? 1 : level + 1, mother));
      //console.log(request.data);
      dispatch(setTasks(request.data, level, mother));
    } catch (err) {
      dispatch(setTasksError(err));
    }
  };
};

export const updateTask = (taskId, updatedTask) => {
  const url = ENDPOINTS.TASK_UPDATE(taskId);
  return async (dispatch) => {
    let status = 200;
    let task = {};
    try {
      const res = await axios.put(url, updatedTask);
      task = res.data;
    } catch (err) {
      status = 400;
    }

    await dispatch(putUpdatedTask(updatedTask, taskId, status));
  };
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

export const copyTask = (taskId) => {
  return async (dispatch) => {
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

/**
 * Error when setting project
 * @param payload : error status code
 */
export const setTasksError = (err) => {
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

export const updateNums = (updatedList) => {
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

export const saveTmpTask = (taskId) => {
  return {
    type: types.COPY_TASK,
    taskId,
  };
};
