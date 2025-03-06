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
    case types.FETCH_USER_TEAMS_START:
      return { ...allTeams, fetching: true, status: '200' };

    case types.FETCH_USER_TEAMS_ERROR:
      return { ...allTeams, fetching: false, status: '404' };

    case types.RECEIVE_ALL_USER_TEAMS:
      return updateObject(allTeams, {
        allTeams: action.payload,
        fetching: false,
        fetched: true,
        status: '200',
      });

    case types.ADD_NEW_TEAM:
      return updateObject(allTeams, {
        allTeams: Object.assign([...allTeams.allTeams, action.payload]),
        fetching: false,
        fetched: true,
        status: '200',
      });

    case types.USER_TEAMS_UPDATE:
      const index = allTeams.allTeams.findIndex(team => team._id === action.team._id);
      return updateObject(allTeams, {
        allTeams: Object.assign([
          ...allTeams.allTeams.slice(0, index),
          action.team,
          ...allTeams.allTeams.slice(index + 1),
        ]),
        fetching: false,
        fetched: true,
        status: '200',
      });

    case types.TEAMS_DELETE:
      return updateObject(allTeams, {
        allTeams: Object.assign(allTeams.allTeams.filter(item => item._id !== action.team)),
        fetching: false,
        fetched: true,
        status: '200',
      });

    case types.UPDATE_TEAM:
      const teams = Object.assign([...allTeams.allTeams]);
      const updatedTeam = teams.find(team => team._id === action.teamId);
      updatedTeam.isActive = action.isActive;
      updatedTeam.teamName = action.teamName;
      updatedTeam.teamCode = action.teamCode;
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
          const updatedMembers = team.members.map(member => {
            if (member.userId === userId) {
              member.visible = visibility;
            }
            return member;
          });

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
        const payload = action.payload;
        return {
          ...allTeams,
          allTeamCode: payload,
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

    default:
      return allTeams;
  }
};
