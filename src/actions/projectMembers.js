/** *******************************************************************************
 * Action: MEMBER MEMBERSHIP
 * Author: Henry Ng - 02/03/20
 ******************************************************************************* */
import axios from 'axios';
import * as types from '../constants/projectMembership';
import { ENDPOINTS } from '../utils/URL';

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
          const isAssigned = members.some(member => member._id === user._id);
          return { ...user, assigned: isAssigned };
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
 */
// export const findUserProfiles = keyword => {
//   // Creates an array containing the first and last name and filters out whitespace
//   const fullName = keyword.split(' ').filter(name => name !== '');

//   return async (dispatch, getState) => {
//     try {
//       let response;
//       if (fullName[0] && fullName[1]) {
//         response = await axios.get(
//           ENDPOINTS.USER_PROFILE_BY_FULL_NAME(`${fullName[0]} ${fullName[1]}`),
//         );
//       } else {
//         response = await axios.get(ENDPOINTS.USER_PROFILE_BY_SINGLE_NAME(fullName[0]));
//         console.log(response);
//       }
//       await dispatch(findUsersStart());
//       if (keyword !== '') {
//         let users = response.data;
//         const { members } = getState().projectMembers;
//         users = users.map(user => {
//           if (!members.find(member => member._id === user._id)) {
//             return (user = { ...user, assigned: false });
//           }
//           return (user = { ...user, assigned: true });
//         });
//         dispatch(foundUsers(users));
//       } else {
//         dispatch(foundUsers([]));
//       }
//     } catch (error) {
//       dispatch(foundUsers([]));
//       dispatch(findUsersError(error));
//     }
//   };
// };

// Done By Mohammad

export const findUserProfiles = keyword => {
  // Creates an array containing the first and last name and filters out whitespace
  const fullNameRegex = keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'); // Escape special characters

  return async (dispatch, getState) => {
    try {
      const response = await axios.get(ENDPOINTS.USER_PROFILE_BY_FULL_NAME(fullNameRegex));

      await dispatch(findUsersStart());
      if (keyword !== '') {
        let users = response.data;
        const { members } = getState().projectMembers;
        users = users.map(user => {
          const isAssigned = members.some(member => member._id === user._id);
          return { ...user, assigned: isAssigned };
        });
        dispatch(foundUsers(users));
      } else {
        dispatch(foundUsers([]));
      }
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

  return async dispatch => {
    request
      .then(() => {
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
      .catch(err => {
        // console.log("Error", err);
        dispatch(addNewMemberError(err));
      });
  };
};