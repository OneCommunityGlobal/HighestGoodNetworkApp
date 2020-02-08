import * as types from './../constants/projectMembership'

const allMembershipInital = {
  projectName: '',
  fetching: false,
  fetched: false,
  members: [],
  foundUsers: [],
  error: ""
}


export const projectMembershipReducer = (allMembership = allMembershipInital, action) => {
  switch (action.type) {
    case types.FETCH_MEMBERS_START:
      return { ...allMembership, fetched: false, fetching: true, error: "none" }
    case types.FETCH_MEMBERS_ERROR:
      return { ...allMembership, fetched: true, fetching: false, error: action.err }
    case types.RECEIVE_MEMBERS:
      return { ...allMembership, members: action.members, fetched: true, fetching: false, error: "none" }
    case types.FIND_USERS_START:
      return { ...allMembership, fetched: false, fetching: true, error: "none" }
    case types.FIND_USERS_ERROR:
      return { ...allMembership, fetched: true, fetching: false, error: action.err }
    case types.FOUND_USERS:
      return { ...allMembership, foundUsers: action.users, fetched: true, fetching: false, error: "none" }

  }
  return allMembership;
};
