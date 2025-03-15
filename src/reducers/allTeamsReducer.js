import * as types from '../constants/allTeamsConstants';

const userTeamsInitial = {
  fetching: false,
  fetched: false,
  allTeams: [],
  allTeamCode: [],
  teamCodeGroup: {},
  teamCodes: [],
  status: 404,
};

export const updateObject = (oldObject, updatedProperties) => ({
  ...oldObject,
  ...updatedProperties,
});

export const allUserTeamsReducer = (allTeams = userTeamsInitial, action) => {
  switch (action.type) {
    case types.FETCH_USER_TEAMS_START:
      return { ...allTeams, fetching: true, status: '200' };

    case types.FETCH_USER_TEAMS_ERROR:
      return { ...allTeams, fetching: false, status: '404' };

    case types.RECEIVE_ALL_USER_TEAMS:
      console.log('REDUCER 1: RECEIVE_ALL_USER_TEAMS action received with payload length:', action.payload.length);
      return updateObject(allTeams, {
        allTeams: action.payload,
        fetching: false,
        fetched: true,
        status: '200',
      });

    case types.ADD_NEW_TEAM:
      return updateObject(allTeams, {
        allTeams: [...allTeams.allTeams, action.payload], // Simplified Object.assign
        fetching: false,
        fetched: true,
        status: '200',
      });

    case types.USER_TEAMS_UPDATE:
      const index = allTeams.allTeams.findIndex(team => team._id === action.team._id);
      return updateObject(allTeams, {
        allTeams: [
          ...allTeams.allTeams.slice(0, index),
          action.team,
          ...allTeams.allTeams.slice(index + 1),
        ], // Simplified Object.assign
        fetching: false,
        fetched: true,
        status: '200',
      });

    case types.TEAMS_DELETE:
      return updateObject(allTeams, {
        allTeams: allTeams.allTeams.filter(item => item._id !== action.team), // Simplified Object.assign
        fetching: false,
        fetched: true,
        status: '200',
      });

    case types.UPDATE_TEAM:
      const teams = [...allTeams.allTeams]; // Simplified Object.assign
      const updatedTeam = teams.find(team => team._id === action.teamId);
      if (updatedTeam) { // Added null check
        updatedTeam.isActive = action.isActive;
        updatedTeam.teamName = action.teamName;
        updatedTeam.teamCode = action.teamCode;
      }
      return updateObject(allTeams, {
        allTeams: teams,
        fetching: false,
        fetched: true,
        status: '200',
      });

    case types.UPDATE_TEAM_MEMBER_VISIBILITY:
      const { teamId, userId, visibility } = action;
      const updatedTeams = allTeams.allTeams.map(team => {
        if (team._id === teamId) {
          const updatedMembers = team.members?.map(member => { // Added optional chaining
            if (member.userId === userId) {
              return { ...member, visible: visibility }; // Immutable update
            }
            return member;
          }) || [];

          return { ...team, members: updatedMembers };
        }
        return team;
      });
      return updateObject(allTeams, {
        allTeams: updatedTeams,
        fetching: false,
        fetched: true,
        status: '200',
      });
      
    case types.FETCH_ALL_TEAM_CODE_SUCCESS:
      return {
        ...allTeams,
        allTeamCode: action.payload,
        fetching: false,
        fetched: true,
        status: '200',
      };

    case types.FETCH_ALL_TEAM_CODE_FAILURE:
      return {
        ...allTeams,
        fetching: false,
        fetched: false,
        status: '500',
      };
      
    case types.UPDATE_TEAM_CODE_DATA:
      console.log('REDUCER 2: UPDATE_TEAM_CODE_DATA action received');
      console.log('REDUCER 3: Team codes in payload:', 
      action.payload.teamCodes.map(tc => tc.value));
      return updateObject(allTeams, {
        teamCodeGroup: action.payload.teamCodeGroup,
        teamCodes: action.payload.teamCodes,
        fetching: false,
        fetched: true,
        status: '200',
      });
      
    case types.UPDATE_ALL_TEAMS:
      return updateObject(allTeams, {
        allTeams: action.payload,
        fetching: false,
        fetched: true,
        status: '200',
      });
    
    default:
      return allTeams;
  }
};