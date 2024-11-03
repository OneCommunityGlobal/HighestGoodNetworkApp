import * as types from "../constants/projectMembership";

const allMembershipInital = {
  projectName: '',
  fetching: false,
  fetched: false,
  members: [],
  foundUsers: [],
  error: '',

  allTimeMembers: [],
  allTimeFetching: false,
  allTimeFetched: false,
  allTimeError: '',

};

export const projectMembershipReducer = (allMembership = allMembershipInital, action) => {
  //console.log('action', action)
  switch (action.type) {
    case types.FETCH_MEMBERS_START:
      return { ...allMembership, fetched: false, fetching: true, error: 'none' };
    case types.FETCH_MEMBERS_ERROR:
      return { ...allMembership, fetched: true, fetching: false, error: action.err };
    case types.RECEIVE_MEMBERS:
      return {
        ...allMembership,
        members: action.members,
        fetched: true,
        fetching: false,
        error: 'none',
      };
    case types.FIND_USERS_START:
      return { ...allMembership, fetched: false, fetching: true, error: 'none' };
    case types.FIND_USERS_ERROR:
      return { ...allMembership, fetched: true, fetching: false, error: action.err };
    case types.FOUND_USERS:
      return {
        ...allMembership,
        foundUsers: action.users,
        fetched: true,
        fetching: false,
        error: 'none',
      };
    case types.ADD_NEW_MEMBER:
      return { ...allMembership, members: [action.member, ...allMembership.members] };
    case types.ADD_NEW_MEMBER_ERROR:
      return { ...allMembership, fetched: true, fetching: false, error: action.err };
    case types.DELETE_MEMBER:
      const indexMember = allMembership.members.findIndex(member => member._id === action.userId);
      return {
        ...allMembership,
        members: [
          ...allMembership.members.slice(0, indexMember),
          ...allMembership.members.slice(indexMember + 1),
        ],
    };
    case types.REMOVE_FOUND_USER:
      const indexUser = allMembership.foundUsers.findIndex(user => user._id === action.userId);
      return {
        ...allMembership,
        foundUsers: [
          ...allMembership.foundUsers.slice(0, indexUser),
          ...allMembership.foundUsers.slice(indexUser + 1),
        ],
      };
    
      case types.FETCH_ALL_TIME_MEMBERS_START:
        return { ...allMembership, allTimeFetched: false, allTimeFetching: true, allTimeError: 'none' };
      case types.FETCH_ALL_TIME_MEMBERS_ERROR:
        return { ...allMembership, allTimeFetched: true, allTimeFetching: false, allTimeError: action.err };
    case types.RECEIVE_ALL_TIME_MEMBERS:
     // console.log("Reducer  -- ",action)
        return {
          ...allMembership,
          allTimeMembers: action.allTimeMembers,
          allTimeFetched: true,
          allTimeFetching: false,
          allTimeError: 'none',
        };

       
    default:
      return allMembership;
  }
};
