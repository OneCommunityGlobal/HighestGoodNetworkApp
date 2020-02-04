import * as types from './../constants/projectMembership'

const allMembershipInital = {
  projectName: '',
  fetching: false,
  fetched: false,
  members: [],
  error: "200"
}


export const projectMembershipReducer = (allMembership = allMembershipInital, action) => {
  switch (action.type) {
    case types.FETCH_MEMBERS_START:
      return { ...allMembership, fetching: true }
      break;
    case types.FETCH_MEMBERS_ERROR:
      return { ...allMembership, fetched: true, fetching: false, error: action.err }
      break;
    case types.RECEIVE_MEMBERS:
      return { ...allMembership, members: action.members, fetched: true, fetching: false }
      break;
  }
  return allMembership;
};
