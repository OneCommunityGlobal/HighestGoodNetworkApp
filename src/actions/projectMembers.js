/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
/* eslint-disable no-return-assign */
/** *******************************************************************************
 * Action: MEMBER MEMBERSHIP
 * Author: Henry Ng - 02/03/20
 ******************************************************************************* */
import axios from 'axios';
import * as types from '../constants/projectMembership';
import { ENDPOINTS } from '~/utils/URL';
/** *****************************************
 * ACTION CREATORS
 ****************************************** */

export const getAllUserProfiles = () => {
  const request = axios.get(ENDPOINTS.USER_PROFILES);
  return async (dispatch, getState) => {
    await dispatch(findUsersStart());
    request
      .then(res => {
        const { members } = getState().projectMembers;
        const users = res.data.map(user => {
          if (!members.some(member => member._id === user._id)) {
            return { ...user, assigned: false };
          }
          return { ...user, assigned: true };
        });
        // console.log(users);
        dispatch(foundUsers(users));
      })
      .catch(err => {
        // console.log("Error", err);
        dispatch(findUsersError(err));
      });
  };
};

/**
 * Call API to find a user profile
 * FIX: Ensure API response is always an array and handle backend variations
 */
export const findUserProfiles = (keyword, activeOnly = true) => {
  return async (dispatch, getState) => {
    try {
      dispatch(findUsersStart());

      const q = keyword.trim();
      if (!q) {
        dispatch(foundUsers([]));
        return;
      }

      const url = ENDPOINTS.USER_PROFILE_BY_FULL_NAME(encodeURIComponent(q), activeOnly);
      const { data } = await axios.get(url);

      // DEBUG: Log the API response for troubleshooting
      // eslint-disable-next-line no-console
      console.log('findUserProfiles API response:', data);

      // FIX: Support both array and object with 'users' property
      let userList = [];
      if (Array.isArray(data)) {
        userList = data;
      } else if (Array.isArray(data?.users)) {
        userList = data.users;
      } else if (Array.isArray(data?.result)) {
        userList = data.result;
      }

      const { members } = getState().projectMembers;
      const memberIds = new Set(members.map(m => m._id));

      const users = userList.map(u => ({
        ...u,
        assigned: memberIds.has(u._id),
      }));

      dispatch(foundUsers(users));
    } catch (error) {
      dispatch(foundUsers([]));
      dispatch(findUsersError(error));
    }
  };
};

/**
 * Call API to get all members
 */
export const fetchAllMembers = projectId => {
  // const request = axios.get(ENDPOINTS.PROJECT_MEMBER(projectId));
  return async dispatch => {
    dispatch(setMemberStart());
    dispatch(foundUsers([])); // Clear found users
    try {
      const response = await axios.get(ENDPOINTS.PROJECT_MEMBER(projectId));
      dispatch(setMembers(response.data));
    } catch (err) {
      dispatch(setMembersError(err));
    }
  };
};

/**
 * Call API to get members summary (lightweight, no profile pics)
 * Used by Members component for better performance
 */
export const fetchMembersSummary = projectId => {
  return async dispatch => {
    dispatch(setMemberStart());
    dispatch(foundUsers([])); // Clear found users
    try {
      const response = await axios.get(ENDPOINTS.PROJECT_MEMBER_SUMMARY(projectId));
      dispatch(setMembers(response.data));
    } catch (err) {
      dispatch(setMembersError(err));
    }
  };
};

/*
 * Call API to find active members out of
 * the members of one project
 */
export const getProjectActiveUser = () => {
  const request = axios.get(ENDPOINTS.USER_PROFILES);
  return async (dispatch, getState) => {
    await dispatch(findUsersStart());
    request
      .then(res => {
        const { members } = getState().projectMembers;
        const users = res.data.filter(user => {
          return members.find(member => member._id === user._id) && user.isActive === true;
        });
        dispatch(foundUsers(users));
      })
      .catch(err => {
        dispatch(findUsersError(err));
      });
  };
};

export const fetchProjectsWithActiveUsers = () => {
  return async dispatch => {
    try {
      const response = await axios.get(ENDPOINTS.PROJECTS_WITH_ACTIVE_USERS);
      dispatch(fetchProjectsActiveUsers(response.data));
    } catch (error) {
      // console.error(error);
      dispatch(fetchProjectsActiveUsersWithError(error));
    }
  };
};

/**
 * Call API to assign/ unassign project
 */
export const assignProject = (projectId, userId, operation, firstName, lastName, isActive) => {
  const request = axios.post(ENDPOINTS.PROJECT_MEMBER(projectId), {
    projectId,
    users: [
      {
        userId,
        operation,
      },
    ],
  });

  return async dispatch => {
    request
      .then(res => {
        // console.log("RES", res);
        if (operation === 'Assign') {
          dispatch(
            assignNewMember({
              _id: userId,
              firstName,
              lastName,
              isActive
            }),
          );
          // dispatch(removeFoundUser(userId));
        } else {
          dispatch(deleteMember(userId));
        }
      })
      .catch(err => {
        // console.log("Error", err);
        dispatch(addNewMemberError(err));
      });
  };
};

/**
 * Call API to find project members
 */
export const findProjectMembers = (_projectId, query) => {
  return async (dispatch, getState) => {
    dispatch(findUsersStart());

    const q = (query || '').trim();
    if (!q) {
      dispatch(foundUsers([]));
      return;
    }

    try {
      // backend expects ?search=... not /search/...
      const { data } = await axios.get(
        ENDPOINTS.USER_PROFILE_BY_FULL_NAME(encodeURIComponent(q))
      );

      const list = Array.isArray(data) ? data
        : Array.isArray(data?.users) ? data.users
          : [];

      const assigned = new Set(getState().projectMembers.members.map(m => m._id));
      const users = list.map(u => ({ ...u, assigned: assigned.has(u._id) }));

      dispatch(foundUsers(users));
    } catch (err) {
      dispatch(foundUsers([]));
      dispatch(findUsersError(err));
    }
  };
};

/** *****************************************
 * PLAIN OBJ ACTIONS
 ****************************************** */

/**
 * Set a flag that fetching Members
 */
export const setMemberStart = () => {
  return {
    type: types.FETCH_MEMBERS_START,
  };
};

/**
 * set Members in store
 * @param payload : Members []
 */
export const setMembers = members => {
  return {
    type: types.RECEIVE_MEMBERS,
    members,
  };
};

/**
 * Error when setting project
 * @param payload : error status code
 */
export const setMembersError = err => {
  return {
    type: types.FETCH_MEMBERS_ERROR,
    err,
  };
};

/**
 * Set a flag that finding Members
 */
export const findUsersStart = () => {
  return {
    type: types.FIND_USERS_START,
  };
};

/**
 * set Users in store
 * @param payload : Users []
 */
export const foundUsers = users => {
  return {
    type: types.FOUND_USERS,
    users,
  };
};

/**
 * Error when setting project
 * @param payload : error status code
 */
export const findUsersError = err => {
  return {
    type: types.FIND_USERS_ERROR,
    err,
  };
};

/**
 * add new member to project
 * @param member : {}
 */
export const assignNewMember = member => {
  return {
    type: types.ADD_NEW_MEMBER,
    member,
  };
};

/**
 * remove a member from project
 * @param userId : _id
 */
export const deleteMember = userId => {
  return {
    type: types.DELETE_MEMBER,
    userId,
  };
};

/**
 * remove found user after assign
 * @param userId : _id
 */
export const removeFoundUser = userId => {
  return {
    type: types.REMOVE_FOUND_USER,
    userId,
  };
};

/**
 * Error when add new member
 * @param payload : error status code
 */
export const addNewMemberError = err => {
  return {
    type: types.ADD_NEW_MEMBER_ERROR,
    err,
  };
};

export const fetchProjectsActiveUsers = data => {
  return {
    type: types.FETCH_PROJECTS_ACTIVE_USERS_SUCCESS,
    payload: data,
  };
};

export const fetchProjectsActiveUsersWithError = err => {
  return {
    type: types.FETCH_PROJECTS_ACTIVE_USERS_ERROR,
    payload: err,
  };
};

/**
 * Set a flag that finding project members
 */
export const findProjectMembersStart = () => {
  return {
    type: types.FIND_PROJECT_MEMBERS_START,
  };
};

/**
 * Set project members in store
 * @param payload : Project members []
 */
export const foundProjectMembers = members => {
  return {
    type: types.FOUND_PROJECT_MEMBERS,
    members,
  };
};

/**
 * Error when finding project members
 * @param payload : error status code
 */
export const findProjectMembersError = err => {
  return {
    type: types.FIND_PROJECT_MEMBERS_ERROR,
    err,
  };
};
