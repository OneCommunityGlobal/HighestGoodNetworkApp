// export const allTeamsReducer = (allTeams = null, action) => {
//   if (action.type === 'GET_ALL_TEAMS') {
//     return action.payload;
//   }

//   return allTeams;
// };
import * as types from '../constants/allTeamsConstants'

const userTeamsInitial = {
  fetching: false,
  fetched: false,
  allTeams: [],
  status: 404
}

export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties
  };
};

export const allUserTeamsReducer = (allTeams = userTeamsInitial, action) => {
  debugger;
  switch (action.type) {

    case types.FETCH_USER_TEAMS_START:
      return { ...allTeams, fetching: true, status: "200" }

    case types.FETCH_USER_TEAMS_ERROR:
      return { ...allTeams, fetching: false, status: "404" }

    case types.RECEIVE_ALL_USER_TEAMS:
      return updateObject(allTeams, {

        allTeams: action.payload,
        fetching: false,
        fetched: true,
        status: "200"
      });
    case types.ADD_NEW_TEAM:
      return { ...allTeams }
    case types.USER_TEAMS_UPDATE:
      let index = allTeams.allTeams.findIndex(team => team._id == action.team._id);
      return updateObject(allTeams, {
        allTeams: Object.assign([...allTeams.allTeams.slice(0, index),
        action.team,
        ...allTeams.allTeams.slice(index + 1)]),
        fetching: false,
        fetched: true,
        status: "200"
      });

    // case types.USER_TEAMS_DELETE:
    //   let deletedIndex = userProfiles.userProfiles.findIndex(user => user._id == action.user._id);
    //   return updateObject(userProfiles, {
    //     userProfiles: Object.assign([...userProfiles.userProfiles.slice(0, deletedIndex),
    //     ...userProfiles.userProfiles.slice(deletedIndex + 1)]),
    //     fetching: false,
    //     fetched: true,
    //     status: "200"
    //   });

    default:
      return allTeams
  }
};
