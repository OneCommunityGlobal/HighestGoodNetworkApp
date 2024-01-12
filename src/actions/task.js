/** *******************************************************************************
 * Action: Tasks
 * Author: Henry Ng - 03/20/20
 ******************************************************************************* */
import axios from 'axios';
import moment from 'moment';
import {
  fetchTeamMembersTaskSuccess,
  fetchTeamMembersTimeEntriesSuccess,
  updateTeamMembersTimeEntrySuccess,
  fetchTeamMembersDataBegin,
  fetchTeamMembersDataError,
  deleteTaskNotificationSuccess,
  deleteTaskNotificationBegin,
} from 'components/TeamMemberTasks/actions';
import { createTaskEditSuggestionHTTP } from 'components/TaskEditSuggestions/service';
import * as types from '../constants/task';
import { ENDPOINTS } from '../utils/URL';
import { createOrUpdateTaskNotificationHTTP } from './taskNotification';
import { dispatch } from 'd3';

const selectFetchTeamMembersTaskData = state => state.auth.user.userid;
const selectUserId = state => state.auth.user.userid;
const selectUpdateTaskData = (state, taskId) =>
  state.tasks.taskItems.find(({ _id }) => _id === taskId);

export const fetchTeamMembersTask = (displayUserId) => async (dispatch) => {
  try {
    dispatch(fetchTeamMembersDataBegin());

    const { data: usersWithTasks } = await axios.get(ENDPOINTS.TEAM_MEMBER_TASKS(displayUserId));

    dispatch(fetchTeamMembersTaskSuccess({ usersWithTasks }));

    await dispatch(fetchTeamMembersTimeEntries());
  } catch (error) {
    dispatch(fetchTeamMembersDataError());
  }
};

export const fetchTeamMembersTimeEntries = () => async (dispatch, getState) => {
  try {
    dispatch(fetchTeamMembersDataBegin());

    const { teamMemberTasks } = getState();
    const fromDate = moment()
      .tz('America/Los_Angeles')
      .subtract(72, 'hours')
      .format('YYYY-MM-DD');
    const toDate = moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD');

    // only request for users with task
    const userIds = teamMemberTasks.usersWithTasks.map(user => user.personId)

    const { data: usersWithTimeEntries } = await axios.post(ENDPOINTS.TIME_ENTRIES_USER_LIST, {
      users: userIds, 
      fromDate, 
      toDate
    });

    dispatch(fetchTeamMembersTimeEntriesSuccess({ usersWithTimeEntries }));
  } catch (error) {
    dispatch(fetchTeamMembersDataError());
  }
};

export const editTeamMemberTimeEntry = (newDate) => async (dispatch) => {
  const { userProfile, ...timeEntry } = newDate;
  const timeEntryURL = ENDPOINTS.TIME_ENTRY_CHANGE(timeEntry._id);
  const userProfileURL = ENDPOINTS.USER_PROFILE(userProfile._id);
  try {
    const updateTimeEntryPromise = axios.put(timeEntryURL, timeEntry);
    const updateUserProfilePromise = axios.put(userProfileURL, userProfile);
    const res = await Promise.all([updateTimeEntryPromise, updateUserProfilePromise]);
    const { data: newTimeEntry } = res[0];
    dispatch(updateTeamMembersTimeEntrySuccess({ ...newTimeEntry, userProfile }));
  } catch (e) {
    console.log(e)
  }
};

// TODO: TeamMemberTasks.jsx dispatch
export const deleteTaskNotification = (userId, taskId, taskNotificationId) => async (
  dispatch,
  getState,
) => {
  try {
    // dispatch(deleteTaskNotificationBegin());
    const res = await axios.delete(ENDPOINTS.DELETE_TASK_NOTIFICATION_BY_USER_ID(taskId, userId));

    //const res = await axios.delete(ENDPOINTS.DELETE_TASK_NOTIFICATION(taskNotificationId));
    dispatch(deleteTaskNotificationSuccess({ userId, taskId, taskNotificationId }));
    // window.location.reload(false);
  } catch (error) {
    // dispatch(deleteTaskNotificationError());
  }
};

export const deleteChildrenTasks = taskId => {
  return async (dispatch, getState) => {
  let status = 200;
  try {
    await axios.post(ENDPOINTS.DELETE_CHILDREN(taskId));
  } catch (error) {
    console.log(error);
  }
}};

export const addNewTask = (newTask, wbsId, pageLoadTime) => async (dispatch, getState) => {
  let status = 200;
  let _id = null;
  let task = {};
  try {
    const wbs = await axios.get(ENDPOINTS.TASK_WBS(wbsId));
    if (Date.parse(wbs.data.modifiedDatetime) > pageLoadTime) {
      dispatch(setAddTaskError('outdated'));
    } else {
      const res = await axios.post(ENDPOINTS.TASK(wbsId), newTask);
      dispatch(postNewTask(res.data, status));
      _id = res.data._id;
      status = res.status;
      task = res.data;
      const userIds = task.resources.map(resource => resource.userID);
      await createOrUpdateTaskNotificationHTTP(task._id, {}, userIds);
    }
  } catch (error) {
    status = 400;
  }
  newTask._id = _id;
};

export const updateTask = (taskId, updatedTask, hasPermission, prevTask) => async (dispatch, getState) => {
  let status = 200;
  try {
    const state = getState();
    
    let oldTask 
    if(prevTask){
      oldTask = prevTask
    }else{
      oldTask = selectUpdateTaskData(state, taskId);
    }
    
    if (hasPermission) {
      await axios.put(ENDPOINTS.TASK_UPDATE(taskId), updatedTask);
      const userIds = updatedTask.resources.map(resource => resource.userID);
      await createOrUpdateTaskNotificationHTTP(taskId, oldTask, userIds);   
    } else {
      await createTaskEditSuggestionHTTP(taskId, selectUserId(state), oldTask, updatedTask);
    }
  } catch (error) {
    // dispatch(fetchTeamMembersTaskError());
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
  };
};

export const updateNumList = (wbsId, list) => {
  const url = `${ENDPOINTS.TASKS_UPDATE  }/num`;
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
  return async dispatch => {
    const url = ENDPOINTS.MOVE_TASKS(wbsId);
    try {
      await axios.put(url, { fromNum, toNum });
    } catch (err) {
      dispatch(setTasksError(err));
    }
    dispatch(emptyTaskItems());
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

export const deleteTask = (taskId, mother) => {
  const url = ENDPOINTS.TASK_DEL(taskId, mother);
  return async dispatch => {
    let status = 200;
    try {
      await axios.post(url);
    } catch (err) {
      status = 400;
    }
    dispatch(emptyTaskItems());
    // await dispatch(removeTask(taskId, status));
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

export const setAddTaskError = err => {
  return {
    type: types.ADD_NEW_TASK_ERROR,
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
