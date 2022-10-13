/** *******************************************************************************
 * Action: MEMBER MEMBERSHIP
 * Author: Henry Ng - 02/03/20
 ******************************************************************************* */
import axios from 'axios';
import * as types from '../constants/projectMembership';
import { ENDPOINTS } from '../utils/URL';
/** *****************************************
 * ACTION CREATORS
 ****************************************** */

export const getAllUserProfiles = () => {
  const request = axios.get(ENDPOINTS.USER_PROFILES);
  return async (dispatch, getState) => {
    await dispatch(findUsersStart());
    request
      .then((res) => {
        let users = res.data;
        const { members } = getState().projectMembers;
        users = users.map((user) => {
          if (!members.find((member) => member._id === user._id)) {
            return (user = { ...user, assigned: false });
          }
          return (user = { ...user, assigned: true });
        });
        // console.log(users);
        dispatch(foundUsers(users));
      })
      .catch((err) => {
        // console.log("Error", err);
        dispatch(findUsersError(err));
      });
  };
};

/**
 * Call API to find a user profile
 */
export const findUserProfiles = (keyword) => {
  // console.log(ENDPOINTS.USER_PROFILES, keyword);
  const request = axios.get(ENDPOINTS.USER_PROFILES);
  // console.log(request);

  return async (dispatch, getState) => {
    await dispatch(findUsersStart());
    request
      .then((res) => {
        // console.log("FOUND USER ", res);
        if (keyword.trim() !== '') {
          let users = res.data.filter((user) => (`${user.firstName} ${user.lastName}`).toLowerCase().includes(keyword.toLowerCase()));
          const { members } = getState().projectMembers;
          users = users.map((user) => {
            if (!members.find((member) => member._id === user._id)) {
              return (user = { ...user, assigned: false });
            }
            return (user = { ...user, assigned: true });
          });
          // console.log(users);
          dispatch(foundUsers(users));
        } else {
          dispatch(foundUsers([]));
        }
      })
      .catch((err) => {
        // console.log("Error", err);
        dispatch(findUsersError(err));
      });
  };
};

/**
 * Call API to get all members
 */
export const fetchAllMembers = (projectId) => {
  const request = axios.get(ENDPOINTS.PROJECT_MEMBER(projectId));
  return async (dispatch) => {
    await dispatch(setMemberStart());
    await dispatch(foundUsers([]));
    request
      .then((res) => {
        // console.log("RES", res);
        dispatch(setMembers(res.data));
      })
      .catch((err) => {
        // console.log("Error", err);
        dispatch(setMembersError(err));
      });
  };
};

/**
 * Call API to assign/ unassign project
 */
export const assignProject = (projectId, userId, operation, firstName, lastName) => {
  const request = axios.post(ENDPOINTS.PROJECT_MEMBER(projectId), {
    projectId,
    users: [
      {
        userId,
        operation,
      },
    ],
  });

  return async (dispatch) => {
    request
      .then((res) => {
        // console.log("RES", res);
        if (operation === 'Assign') {
          dispatch(
            assignNewMember({
              _id: userId,
              firstName,
              lastName,
            }),
          );
          dispatch(removeFoundUser(userId));
        } else {
          dispatch(deleteMember(userId));
        }
      })
      .catch((err) => {
        // console.log("Error", err);
        dispatch(addNewMemberError(err));
      });
  };
};

/** *****************************************
 * PLAIN OBJ ACTIONS
 ****************************************** */

/**
 * Set a flag that fetching Members
 */
export const setMemberStart = () => ({
  type: types.FETCH_MEMBERS_START,
});

/**
 * set Members in store
 * @param payload : Members []
 */
export const setMembers = (members) => ({
  type: types.RECEIVE_MEMBERS,
  members,
});

/**
 * Error when setting project
 * @param payload : error status code
 */
export const setMembersError = (err) => ({
  type: types.FETCH_MEMBERS_ERROR,
  err,
});

/**
 * Set a flag that finding Members
 */
export const findUsersStart = () =>
// console.log("find user start");

  ({
    type: types.FIND_USERS_START,
  })
;

/**
 * set Users in store
 * @param payload : Users []
 */
export const foundUsers = (users) =>
  // console.log("foundUsers");
  ({
    type: types.FOUND_USERS,
    users,
  })
;

/**
 * Error when setting project
 * @param payload : error status code
 */
export const findUsersError = (err) => ({
  type: types.FIND_USERS_ERROR,
  err,
});

/**
 * add new member to project
 * @param member : {}
 */
export const assignNewMember = (member) =>
  // console.log("new member", member);
  ({
    type: types.ADD_NEW_MEMBER,
    member,
  })
;

/**
 * remove a member from project
 * @param userId : _id
 */
export const deleteMember = (userId) => ({
  type: types.DELETE_MEMBER,
  userId,
});

/**
 * remove found user after assign
 * @param userId : _id
 */
export const removeFoundUser = (userId) => ({
  type: types.REMOVE_FOUND_USER,
  userId,
});

/**
 * Error when add new member
 * @param payload : error status code
 */
export const addNewMemberError = (err) => ({
  type: types.ADD_NEW_MEMBER_ERROR,
  err,
});
