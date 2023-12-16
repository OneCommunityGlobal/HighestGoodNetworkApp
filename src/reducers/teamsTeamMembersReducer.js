import * as types from '../constants/allTeamsConstants';

const teamUsersInitial = {
  fetching: false,
  fetched: false,
  teamMembers: [],
  status: 404,
};

export const updateObject = (oldObject, updatedProperties) => ({
  ...oldObject,
  ...updatedProperties,
});

// eslint-disable-next-line default-param-last
export const teamUsersReducer = (teamMembers = teamUsersInitial, action) => {
  switch (action.type) {
    case types.RECEIVE_TEAM_USERS:
      return updateObject(teamMembers, {
        teamMembers: action.payload,
        fetching: false,
        fetched: true,
        status: '200',
      });
    case types.TEAM_MEMBER_ADD:
      return updateObject(teamMembers, {
        teamMembers: Object.assign([...teamMembers.teamMembers, action.member]),
        fetching: false,
        fetched: true,
        status: '200',
      });
    case types.TEAM_MEMBER_DELETE:
      return updateObject(teamMembers, {
        teamMembers: Object.assign(
          teamMembers.teamMembers.filter(item => item._id !== action.member),
        ),
        fetching: false,
        fetched: true,
        status: '200',
      });

    default:
      return teamMembers;
  }
};
