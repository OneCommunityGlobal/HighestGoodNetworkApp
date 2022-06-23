/*********************************************************************************
 * Action: Tasks
 * Author: Henry Ng - 03/20/20
 ********************************************************************************/
import axios from 'axios';
import { fetchTeamMembersTaskSuccess, fetchTeamMembersTaskBegin, fetchTeamMembersTaskError } from 'components/TeamMemberTasks/actions';
import * as types from '../constants/task';
import { ENDPOINTS } from '../utils/URL';
import { createOrUpdateTaskNotificationHTTP } from './taskNotification';

const selectFetchTeamMembersTaskData = (state) => state.auth.user.userid;
const selectUpdateTaskData = (state, taskId) => state.tasks.taskItems.find(({_id}) => _id === taskId);

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
}


  ////BACK
  // // const { leaderBoardData } = props
  // await props.getUserProfile(userId);
  // const { managingTeams } = props; //back
  // let allMembers = [];
  // const teamMembersPromises = [];
  // const memberTimeEntriesPromises = [];
  // const teamMemberTasksPromises = [];
  // // const userProfilePromises = [];

  // // to fetch users in a team
  // // const usersInATeamPromises = [];
  // // const wbsProjectPromises = []
  // // const fetchedProjects = []
  // const finalData = [];
  // // const userNotifications = [];
  // // const taskNotificationPromises = [];
  // const allManagingTeams = [];

  // // const teamMembers = [];

  // console.log(props);
  // if (managingTeams && managingTeams.length) {
  //   // fetch all team members for each team
  //   managingTeams.forEach(team => {
  //     teamMembersPromises.push(httpService.get(ENDPOINTS.TEAM_MEMBERS(team._id)));
  //   });

  //   Promise.all(teamMembersPromises).then(data => {
  //     // console.log('team members', data);
  //     for (let i = 0; i < managingTeams.length; i++) {
  //       allManagingTeams[i] = {
  //         ...managingTeams[i],
  //         members: data[i].data,
  //       };
  //       allMembers = allMembers.concat(data[i].data);
  //     }

  //     // fetch all time entries for current week for all members
  //     const uniqueMembers = _.uniqBy(allMembers, '_id');

  //     // console.log('members: ', uniqueMembers);

  //     const membersId = [];
  //     for (let i = 0; i < uniqueMembers.length; i++) {
  //       membersId.push(uniqueMembers[i]._id);
  //     }

  //     if (membersId.length) {
  //       memberTimeEntriesPromises.push(
  //         httpService.get(ENDPOINTS.TIME_ENTRIES_USER_LIST(membersId)).catch(err => {}),
  //       );
  //     }

  //     if (memberTimeEntriesPromises.length) {
  //       Promise.all(memberTimeEntriesPromises).then(data => {
  //         // console.log('time entries: ', data);
  //         if (data[0].data.length === 0) {
  //           for (let i = 0; i < uniqueMembers.length; i++) {
  //             uniqueMembers[i] = {
  //               ...uniqueMembers[i],
  //               timeEntries: [],
  //             };
  //           }
  //         } else {
  //           for (let i = 0; i < uniqueMembers.length; i++) {
  //             const entries = [];
  //             for (let j = 0; j < data[0]?.data.length; j++) {
  //               if (uniqueMembers[i]._id === data[0].data[j].personId) {
  //                 entries.push(data[0].data[j]);
  //                 // console.log('push');
  //               }
  //             }
  //             uniqueMembers[i] = {
  //               ...uniqueMembers[i],
  //               timeEntries: entries,
  //             };
  //           }
  //         }
  //         // console.log('members after entries: ', uniqueMembers);

  //         // fetch all tasks for each member
  //         teamMemberTasksPromises.push(
  //           httpService.get(ENDPOINTS.TASKS_BY_USERID(membersId)).catch(err => {
  //             if (err.status !== 401) {
  //               console.log(err);
  //             }
  //           }),
  //         );

  //         Promise.all(teamMemberTasksPromises).then(async data => {
  //           // await console.log('tasks by userid', data);

  //           // merge assigned tasks into each user obj
  //           for (let i = 0; i < uniqueMembers.length; i++) {
  //             const userTasks = [];
  //             for (let j = 0; j < data[0]?.data.length; j++) {
  //               for (let k = 0; k < data[0]?.data[j].resources.length; k++) {
  //                 if (data[0].data[j].resources[k].userID === uniqueMembers[i]._id) {
  //                   userTasks.push(data[0].data[j]);
  //                 }
  //               }
  //             }
  //             uniqueMembers[i] = {
  //               ...uniqueMembers[i],
  //               tasks: userTasks,
  //             };
  //           }

  //           // console.log('members after tasks: ', uniqueMembers);

  //           try {
  //             for (let i = 0; i < uniqueMembers.length; i++) {
  //               const user = uniqueMembers[i];
  //               const userLeaderBoardData = uniqueMembers.find(
  //                 member => member._id === user._id,
  //               );
  //               let userWeeklyCommittedHours = 0;
  //               if (userLeaderBoardData) {
  //                 userWeeklyCommittedHours = userLeaderBoardData.weeklyComittedHours;
  //               }
  //               uniqueMembers[i] = {
  //                 ...uniqueMembers[i],
  //                 weeklyCommittedHours: userWeeklyCommittedHours,
  //               };
  //             }

  //             // for each task, must fetch the projectId of its wbs in order to generate appropriate link
  //             // currently fetches all projects, should consider refactoring if number of projects increases
  //             const WBSRes = await httpService.get(ENDPOINTS.WBS_ALL).catch(err => {
  //               if (err.status === 401) {
  //                 loggedOut = true;
  //               }
  //             });
  //             const allWBS = WBSRes.data;
  //             // console.log('tasks', WBSRes.data);

  //             // calculate hours done in current week and add to user obj for ease of access
  //             for (let i = 0; i < uniqueMembers.length; i++) {
  //               let hoursCurrentWeek = 0;
  //               if (uniqueMembers[i].timeEntries.length > 0) {
  //                 hoursCurrentWeek = uniqueMembers[i].timeEntries.reduce(
  //                   (acc, current) => Number(current.hours) + acc,
  //                   0,
  //                 );
  //               }

  //               finalData[i] = {
  //                 ...uniqueMembers[i],
  //                 hoursCurrentWeek,
  //               };
  //             }

  //             // attach projectId of each task onto final user objects
  //             for (let i = 0; i < uniqueMembers.length; i++) {
  //               for (let j = 0; j < uniqueMembers[i].tasks.length; j++) {
  //                 const { wbsId } = uniqueMembers[i].tasks[j];
  //                 const project = allWBS.find(wbs => wbs._id === wbsId);
  //                 finalData[i].tasks[j] = {
  //                   ...finalData[i].tasks[j],
  //                   projectId: project ? project.projectId : '',
  //                 };
  //               }
  //             }

  //             let loggedOut = false;

  //             // console.log('member tasks in obj: ', uniqueMembers);

  //             if (!loggedOut) {
  //               // sort each members' tasks by last modified time
  //               finalData.forEach(user => {
  //                 user.tasks.sort((task1, task2) => {
  //                   const date1 = new Date(task1.modifiedDatetime).valueOf();
  //                   const date2 = new Date(task2.modifiedDatetime).valueOf();
  //                   const timeDifference = date2 - date1;
  //                   return timeDifference;
  //                 });
  //               });

  //               console.log('final data ', finalData)
  //               setFetched(true);
  //               setTeams(finalData);
  //               // });
  //             }
  //           } catch (err) {
  //             // catch error on logout
  //             console.log('err1', err);
  //           }
  //         });
  //       });
  //     }
  //   });
  // } else {
  //   // if user is not in any teams
  //   // console.log('no managing teams');
  //   setFetched(true);
  // };
 
////BACK
///END

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

export const updateTask = (taskId, updatedTask) => async (dispatch, getState) => {
  let status = 200;
  try {
    const state = getState();
    const oldTask = selectUpdateTaskData(state, taskId);
    //dispatch(fetchTeamMembersTaskBegin());
    await axios.put(ENDPOINTS.TASK_UPDATE(taskId), updatedTask);
    const userIds = updatedTask.resources.map(resource => resource.userID);
    await createOrUpdateTaskNotificationHTTP(taskId, oldTask, userIds);
  } catch (error) {
    //dispatch(fetchTeamMembersTaskError());
    status = 400;
  }

  await dispatch(putUpdatedTask(updatedTask, taskId, status));
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
