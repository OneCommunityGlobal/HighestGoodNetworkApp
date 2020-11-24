/*********************************************************************************
 * Action: PROJECTS
 * Author: Henry Ng - 01/17/20
 ********************************************************************************/
import axios from 'axios'
import * as types from './../constants/projects'
import { ENDPOINTS } from '../utils/URL'

/*******************************************
 * ACTION CREATORS
 *******************************************/

/**
 * Call API to get all projects
 */
export const fetchAllProjects = () => {

	const request = axios.get(ENDPOINTS.PROJECTS);

	//console.log(ENDPOINTS.PROJECTS);
	//console.log(request);

	return async dispatch => {
		await dispatch(setProjectsStart());
		request.then(res => {
			//console.log("RES", res);
			dispatch(setProjects(res.data));
		}).catch((err) => {
			console.log("Error", err);
			dispatch(setProjectsError());
		})
	}
}

/**
 * Post new project to DB
 * @param {projectName}: name of new project
 * @param {isActive}: the active status of new project
 */
export const postNewProject = (projectName, isActive) => {
	const url = ENDPOINTS.PROJECTS;
	//console.log("Call API: ", url);
	return async dispatch => {
		let status = 200;
		let _id = null;

		try {
			const res = await axios.post(url, { projectName, isActive })
			_id = res.data._id;
			status = res.status;

		} catch (err) {
			// console.log("TRY CATCH ERR", err);
			status = 400;
		}

		dispatch(
			addNewProject(
				{
					"_id": _id,
					"projectName": projectName,
					"isActive": isActive

				},status
			));

	}
}

/**
 * Post new project to DB
 * @param {projectId}: Id of deleted project
 */
export const deleteProject = (projectId) => {
	const url = ENDPOINTS.PROJECT + projectId;

	//console.log("Delete", projectId);

	return async dispatch => {
		let status = 200

		try {
			const res = await axios.delete(url)
			status = res.status
		} catch (err) {
			// console.log("CAN'T DELETE", err)
			status = 400
		}

		dispatch(removeProject(projectId, status))
	}
}

export const modifyProject = (type, projectId, projectName, isActive) => {
	const url = ENDPOINTS.PROJECT + projectId;
	//console.log("set Active", projectId, projectName, isActive);

	if (type === "setActive") {
		isActive = !isActive;
	}
	return async dispatch => {
		let status = 200;

		try {
			const res = await axios.put(url, {
				"projectName": projectName,
				"isActive": isActive
			})
			status = res.status;

		} catch (err) {
			// console.log("CAN'T Set active", err);
			status = 400;
		}

		dispatch(updateProject(projectId, projectName, isActive, status));

	}
}

/*******************************************
 * PLAIN OBJECT ACTIONS
 *******************************************/

/**
 * Set a flag that fetching projects
 */
export const setProjectsStart = () => {
	return {
		type: types.FETCH_PROJECTS_START
	}
}

/**
 * set Projects in store
 * @param payload : projects []
 */
export const setProjects = payload => {
	return {
		type: types.RECEIVE_PROJECTS,
		payload
	}
}

/**
 * Error when setting project
 * @param payload : error status code
 */
export const setProjectsError = payload => {
	return {
		type: types.FETCH_PROJECTS_ERROR,
		payload
	}
}

export const addNewProject = (payload, status) => {
	return {
		type: types.ADD_NEW_PROJECT,
		payload,
		status
	}
}

export const removeProject = (projectId, status) => {
	return {
		type: types.DELETE_PROJECT,
		projectId,
		status
	}
}

export const updateProject = (projectId, projectName, isActive, status) => {
	return {
		type: types.UPDATE_PROJECT,
		projectId,
		projectName,
		isActive,
		status
	}
}
