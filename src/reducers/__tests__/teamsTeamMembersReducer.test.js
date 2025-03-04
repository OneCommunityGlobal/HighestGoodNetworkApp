import { RECEIVE_TEAM_USERS, TEAM_MEMBER_ADD, TEAM_MEMBER_DELETE, FETCH_TEAM_USERS_START } from '../../constants/allTeamsConstants';
import { teamUsersReducer, updateObject } from '../teamsTeamMembersReducer'

const teamUsersInitial = {
  fetching: false,
  fetched: false,
  teamMembers: [],
  status: 404
};

const teamMembers = {
  teamMembers: [{ 
    _id: '1', 
    firstName: 'First name', 
    lastName: 'Last name', 
    jobTitle: [''], 
    teams: [], 
    projects: ['p1', 'p2']
  }]
};

describe('Teams Team Members Reducer', () => {

    it('Should receive team users', () => {

      const expectedState = { teamMembers:{}, fetching: false, fetched: true, status: '200'};
      const action = { 
        payload: {}, 
        type:RECEIVE_TEAM_USERS 
      };

      const result = teamUsersReducer( teamMembers, action );
      expect(result).toEqual(expectedState);

    });

    it('Should add team member to team', () => {

      const action = { 
        member: { _id: '2', firstName: 'First name', lastName: 'Last name' }, 
        type:TEAM_MEMBER_ADD 
      };

      const expectedResult = { 
        teamMembers:Object.assign([...teamMembers.teamMembers, action.member]), 
        fetching: false, 
        fetched: true, 
        status: '200'
      };

      const result = teamUsersReducer(teamMembers, action);
      expect(result).toEqual(expectedResult);

    });

    it('Should delete member from team', () => {
      
      const action = { 
        member: { _id: '2', firstName: 'First name', lastName: 'Last name' }, 
        type: TEAM_MEMBER_DELETE 
      };

      const expectedResult = { 
        teamMembers:Object.assign(teamMembers.teamMembers.filter(item => item._id !== action.member)), 
        fetching: false, 
        fetched: true, 
        status: '200'
      };

      const result = teamUsersReducer(teamMembers, action);
      expect(result).toEqual(expectedResult);

    });

    it('Should fetch teams user start', () => {
      
      const expectedResult = updateObject(teamMembers, {fetching: true, fetched: false});
      
      const result = teamUsersReducer( teamMembers,{ type: FETCH_TEAM_USERS_START } );
      expect(result).toEqual(expectedResult);

    });

    it('Should return initial teamMemebres in default case ', () =>{

      const result = teamUsersReducer( teamMembers, {} );
      expect(result).toEqual(teamMembers);

    });

})