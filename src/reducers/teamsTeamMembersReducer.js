import * as types from '../constants/allTeamsConstants'


const teamUsersInitial = {
  fetching: false,
  fetched: false,
  teamMembers: [],
  status: 404
}

export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties
  };
};
debugger;
export const teamUsersReducer = (teamMembers = teamUsersInitial, action) => {

  switch (action.type) {

    case types.FETCH_TEAM_USERS_START:
      return { ...teamMembers, fetching: true, status: "200" }

    case types.FETCH_TEAM_USERS_ERROR:
      return { ...teamMembers, fetching: false, status: "404" }

    case types.RECEIVE_TEAM_USERS:
      return updateObject(teamMembers, {

        teamMembers: action.payload,
        fetching: false,
        fetched: true,
        status: "200"
      });
    default:
      return teamMembers
  }


}