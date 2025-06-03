import { teamMembershipReducer } from '../teamMembershipReducer';
const members = [
  {
    id : '1',
    firstName: 'First Name', 
    lastName : 'Last Name', 
    role : 'Manager'
  },

] 

describe('Team Membership Reducer', () => {

  it('get team membership', () => {

    const newPayload = [ { teams: [], projects : [], totalTangibleHrs : '0' } ];

    const action = {
      type: 'GET_TEAM_MEMBERSHIP',
      payload: newPayload,
    };

    const result = teamMembershipReducer(members, action );
    expect(result).toEqual(newPayload);

  });

  it('should return the initial value when an action type is not passed', () => {

    const result = teamMembershipReducer(members, {} );
    expect(result).toEqual(members);

  });

})