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
} from 'components/TeamMemberTasks/actions';
import { createTaskEditSuggestionHTTP } from 'components/TaskEditSuggestions/service';
import { fetchTaskEditSuggestions } from 'components/TaskEditSuggestions/thunks';
import * as types from '../constants/task';
import { ENDPOINTS } from '../utils/URL';
import { createOrUpdateTaskNotificationHTTP } from './taskNotification';

const selectUserId = state => state.auth.user.userid;
const selectUpdateTaskData = (state, taskId) =>
  state.tasks.taskItems.find(({ _id }) => _id === taskId);

/**
 * Action Creators
 */
export const setTasksStart = () => ({
  type: types.FETCH_TASKS_START,
});

export const setTasks = (taskItems, level, mother) => ({
  type: types.RECEIVE_TASKS,
  taskItems,
  level,
  mother,
});

export const emptyTaskItems = () => ({
  type: types.EMPTY_TASK_ITEMS,
});

export const setTasksError = err => ({
  type: types.FETCH_TASKS_ERROR,
  err,
});

export const setAddTaskError = err => ({
  type: types.ADD_NEW_TASK_ERROR,
  err,
});

export const postNewTask = (newTask, status) => ({
  type: types.ADD_NEW_TASK,
  newTask,
  status,
});

export const putUpdatedTask = (updatedTask, taskId, status) => ({
  type: types.UPDATE_TASK,
  updatedTask,
  taskId,
  status,
});

export const swapTasks = (tasks, status) => ({
  type: types.SWAP_TASKS,
  tasks,
  status,
});

export const updateNums = updatedList => ({
  type: types.UPDATE_NUMS,
  updatedList,
});

export const removeTask = (taskId, status) => ({
  type: types.DELETE_TASK,
  taskId,
  status,
});

export const saveTmpTask = taskId => ({
  type: types.COPY_TASK,
  taskId,
});

/**
 * Thunks
 */
export const fetchTeamMembersTimeEntries = () => async (dispatch, getState) => {
  try {
    dispatch(fetchTeamMembersDataBegin());

    const { teamMemberTasks } = getState();
    const fromDate = moment()
      .tz('America/Los_Angeles')
      .subtract(6, 'days')
      .format('YYYY-MM-DD');
    const toDate = moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD');

    // only request for users with task
    const userIds = teamMemberTasks.usersWithTasks.map(user => user.personId);

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

export const editTeamMemberTimeEntry = (newDate) => async (dispatch) => {
  const { userProfile, ...timeEntry } = newDate;
  const timeEntryURL = ENDPOINTS.TIME_ENTRY_CHANGE(timeEntry._id);
  try {
    const { data: newTimeEntry } = await axios.put(timeEntryURL, timeEntry);
    dispatch(updateTeamMembersTimeEntrySuccess({ ...newTimeEntry }));
  } catch (e) {
    throw new Error(e);
  }
};

// TODO: TeamMemberTasks.jsx dispatch
export const deleteTaskNotification = (userId, taskId, taskNotificationId) => async (
  dispatch,
) => {
  try {
    // dispatch(deleteTaskNotificationBegin());
    await axios.delete(ENDPOINTS.DELETE_TASK_NOTIFICATION_BY_USER_ID(taskId, userId));

    // const res = await axios.delete(ENDPOINTS.DELETE_TASK_NOTIFICATION(taskNotificationId));
    dispatch(deleteTaskNotificationSuccess({ userId, taskId, taskNotificationId }));
    // window.location.reload(false);
  } catch (error) {
    // dispatch(deleteTaskNotificationError());
  }
};

export const deleteChildrenTasks = taskId => {
  return async () => {
    try {
      await axios.post(ENDPOINTS.DELETE_CHILDREN(taskId));
    } catch (error) {
      // Removed console.log to eliminate unexpected console statement
    }
  };
};

export const addNewTask = (newTask, wbsId, pageLoadTime) => async (dispatch, getState) => {
  let status = 200;
  try {
    const wbs = await axios.get(ENDPOINTS.TASK_WBS(wbsId));
    if (Date.parse(wbs.data.modifiedDatetime) > pageLoadTime) {
      dispatch(setAddTaskError('outdated'));
    } else {
      const res = await axios.post(ENDPOINTS.TASK(wbsId), newTask);
      dispatch(postNewTask(res.data, res.status));
      const task = res.data;
      const userIds = task.resources.map(resource => resource.userID);
      await createOrUpdateTaskNotificationHTTP(task._id, {}, userIds);
    }
  } catch (error) {
    status = 400;
  }
  // Avoid modifying function parameter by creating a new object if needed
  // newTask._id = _id; // Removed to fix no-param-reassign
};

export const updateTask = (taskId, updatedTask, hasPermission, prevTask) => async (dispatch, getState) => {
  let status = 200;
  try {
    const state = getState();
    
    let oldTask;
    if(prevTask){
      oldTask = prevTask;
    } else {
      oldTask = selectUpdateTaskData(state, taskId);
    }
    
    if (hasPermission) {
      await axios.put(ENDPOINTS.TASK_UPDATE(taskId), updatedTask);
      const userIds = updatedTask.resources.map(resource => resource.userID);
      await createOrUpdateTaskNotificationHTTP(taskId, oldTask, userIds);   
    } else {
      await createTaskEditSuggestionHTTP(taskId, selectUserId(state), oldTask, updatedTask).then(() => {
        dispatch(fetchTaskEditSuggestions());   
      });
    }
  } catch (error) {
    // dispatch(fetchTeamMembersTaskError());
    // Removed console.log to eliminate unexpected console statement
    status = 400;
  }
  // TODO: DISPATCH TO TASKEDITSUGGESETIONS REDUCER TO UPDATE STATE
  await dispatch(putUpdatedTask(updatedTask, taskId, status));
};

export const importTask = (newTask, wbsId) => {
  const url = ENDPOINTS.TASK_IMPORT(wbsId);
  return async dispatch => {
    let status = 200;

    try {
      await axios.post(url, { list: newTask });
      // Removed _id and task as they were not used
    } catch (err) {
      status = 400;
    }
  };
};

export const updateNumList = (wbsId, list) => {
  const url = `${ENDPOINTS.TASKS_UPDATE}/num`;
  return async dispatch => {
    try {
      await axios.put(url, { wbsId, nums: list });
    } catch (err) {
      // status = 400; // Removed as status is not used
      dispatch(setTasksError(err));
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
