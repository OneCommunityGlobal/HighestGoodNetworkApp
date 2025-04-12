import * as types from '../constants/projectMembership';

const allMembershipInital = {
  projectName: '',
  fetching: false,
  fetched: false,
  members: [],
  foundUsers: [],
  activeMemberCounts: {},
  error: '',
};

// eslint-disable-next-line default-param-last
export const projectMembershipReducer = (allMembership = allMembershipInital, action) => {
  switch (action.type) {
    case types.FETCH_MEMBERS_START: {
      return { ...allMembership, fetched: false, fetching: true, error: 'none' };
    }

    case types.FETCH_MEMBERS_ERROR: {
      return { ...allMembership, fetched: true, fetching: false, error: action.err };
    }

    case types.RECEIVE_MEMBERS: {
      return {
        ...allMembership,
        members: action.members,
        fetched: true,
        fetching: false,
        error: 'none',
      };
    }

    case types.FIND_USERS_START: {
      return { ...allMembership, fetched: false, fetching: true, error: 'none' };
    }

    case types.FIND_USERS_ERROR: {
      return { ...allMembership, fetched: true, fetching: false, error: action.err };
    }

    case types.FOUND_USERS: {
      return {
        ...allMembership,
        foundUsers: action.users,
        fetched: true,
        fetching: false,
        error: 'none',
      };
    }

    case types.ADD_NEW_MEMBER: {
      return { ...allMembership, members: [action.member, ...allMembership.members] };
    }

    case types.ADD_NEW_MEMBER_ERROR: {
      return { ...allMembership, fetched: true, fetching: false, error: action.err };
    }

    case types.DELETE_MEMBER: {
      const members = allMembership.members.filter(member => member._id !== action.userId);
      return { ...allMembership, members };
    }

    case types.REMOVE_FOUND_USER: {
      const foundUsers = allMembership.foundUsers.filter(user => user._id !== action.userId);
      return { ...allMembership, foundUsers };
    }

    case types.FETCH_PROJECTS_ACTIVE_USERS_SUCCESS:
      return {
        activeMemberCounts: action.payload,
      };
    case types.FETCH_PROJECTS_ACTIVE_USERS_ERROR:
      return {
        error: action.payload,
      };

    default:
      return allMembership;
  }
};

export default projectMembershipReducer;
