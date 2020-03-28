/*********************************************************************************
 * Action: Tasks  
 * Author: Henry Ng - 03/20/20
 ********************************************************************************/
import axios from 'axios'
import * as types from '../constants/task'
import { ENDPOINTS } from '../utils/URL'



export const addNewTask = (TaskName, projectId) => {
  const url = ENDPOINTS.Task(projectId);
  console.log("Call API: ", url);
  return async dispatch => {
    let status = 200;
    let _id = null;

    const isActive = true;

    try {
      const res = await axios.post(url, { TaskName, isActive })
      _id = res.data._id;
      status = res.status;

    } catch (err) {
      console.log("TRY CATCH ERR", err);
      status = 400;
    }

    await dispatch(
      postNewTask(
        {
          "_id": _id,
          "TaskName": TaskName,
          "isActive": isActive

        },
        status
      ));

  }

}


export const fetchAllTasks = (wbsId) => {
  console.log("fetch tasks");

  const request = axios.get(ENDPOINTS.TASK(wbsId));
  return async dispatch => {
    await dispatch(setTasksStart());
    request.then(res => {
      dispatch(setTasks(res.data));
    }).catch((err) => {
      dispatch(setTasksError(err));
    })
  }
}

/**
* Set a flag that fetching Task  
*/
export const setTasksStart = () => {
  return {
    type: types.FETCH_TASKS_START,
  }
}


/**
 * set Task in store 
 * @param payload : Task [] 
 */
export const setTasks = (taskItems) => {
  return {
    type: types.RECEIVE_TASKS,
    taskItems
  }
}

/**
 * Error when setting project 
 * @param payload : error status code 
 */
export const setTasksError = (err) => {
  return {
    type: types.FETCH_TASKS_ERROR,
    err
  }
}




export const postNewTask = (Task, status) => {
  return {
    type: types.ADD_NEW_TASK,
    Task,
    status
  }
}





