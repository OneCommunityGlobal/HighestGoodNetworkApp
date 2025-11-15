/* eslint-disable default-param-last */
import * as types from '../constants/allTeamsConstants';

const userTeamsInitial = {
  fetching: false,
  fetched: false,
  allTeams: [],
  allTeamCode: [],
  status: 404,
};

export const updateObject = (oldObject, updatedProperties) => ({
  ...oldObject,
  ...updatedProperties,
});

export const allUserTeamsReducer = (allTeams = userTeamsInitial, action) => {
  switch (action.type) {
    case types.FETCH_USER_TEAMS_START: {
      return { ...allTeams, fetching: true, status: '200' };
    }

    case types.FETCH_USER_TEAMS_ERROR: {
      return { ...allTeams, fetching: false, status: '404' };
    }

    case types.RECEIVE_ALL_USER_TEAMS: {
      return {
        ...allTeams,
        allTeams: action.payload,
        fetching: false,
        fetched: true,
        status: '200',
      };
    }

    case types.ADD_NEW_TEAM: {
      return {
        ...allTeams,
        allTeams: [...allTeams.allTeams, action.payload],
        fetching: false,
        fetched: true,
        status: '200',
      };
    }

    case types.USER_TEAMS_UPDATE: {
      const index = allTeams.allTeams.findIndex(team => team._id === action.team._id);
      const updatedTeams = [
        ...allTeams.allTeams.slice(0, index),
        action.team,
        ...allTeams.allTeams.slice(index + 1),
      ];
      return {
        ...allTeams,
        allTeams: updatedTeams,
        fetching: false,
        fetched: true,
        status: '200',
      };
    }

    case types.TEAMS_DELETE: {
      const updatedTeams = allTeams.allTeams.filter(item => item._id !== action.team);
      return {
        ...allTeams,
        allTeams: updatedTeams,
        fetching: false,
        fetched: true,
        status: '200',
      };
    }

    case types.UPDATE_TEAM: {
      const updatedTeams = allTeams.allTeams.map(team =>
        team._id === action.teamId
          ? {
              ...team,
              isActive: action.isActive,
              teamName: action.teamName,
              teamCode: action.teamCode,
            }
          : team,
      );
      return {
        ...allTeams,
        allTeams: updatedTeams,
        fetching: false,
        fetched: true,
        status: '200',
      };
    }

    case types.UPDATE_TEAM_MEMBER_VISIBILITY: {
      const { teamId, userId, visibility } = action;
      const updatedTeams = allTeams.allTeams.map(team => {
        if (team._id === teamId) {
          const updatedMembers = team.members.map(member =>
            member.userId === userId ? { ...member, visible: visibility } : member,
          );
          return { ...team, members: updatedMembers };
        }
        return team;
      });
      return {
        ...allTeams,
        allTeams: updatedTeams,
        fetching: false,
        fetched: true,
        status: '200',
      };
    }

    case types.FETCH_ALL_TEAM_CODE_SUCCESS: {
      const { payload } = action;
      return {
        ...allTeams,
        allTeamCode: payload,
        fetching: false,
        fetched: true,
        status: '200',
      };
    }

    case types.FETCH_ALL_TEAM_CODE_FAILURE: {
      return {
        ...allTeams,
        fetching: false,
        fetched: false,
        status: '500',
      };
    }

    default: {
      return allTeams;
    }
  }
};
