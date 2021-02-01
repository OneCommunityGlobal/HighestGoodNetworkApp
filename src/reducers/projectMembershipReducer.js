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
    case types.ADD_NEW_MEMBER:
      return { ...allMembership, members: [action.member, ...allMembership.members] }
    case types.ADD_NEW_MEMBER_ERROR:
      return { ...allMembership, fetched: true, fetching: false, error: action.err }
    case types.DELETE_MEMBER:
      let indexMember = allMembership.members.findIndex(member => member._id === action.userId);
      return { ...allMembership, members: [...allMembership.members.slice(0, indexMember), ...allMembership.members.slice(indexMember + 1)] }
    case types.REMOVE_FOUND_USER:
      let indexUser = allMembership.foundUsers.findIndex(user => user._id === action.userId);
      return { ...allMembership, foundUsers: [...allMembership.foundUsers.slice(0, indexUser), ...allMembership.foundUsers.slice(indexUser + 1)] }
    default:
      return allMembership;
  }

};
