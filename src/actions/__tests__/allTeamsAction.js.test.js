import { teamMembersFectchACtion } from '../allTeamsAction';
import { RECEIVE_ALL_USER_TEAMS } from '../../constants/allTeamsConstants';

describe('teamMembersFectchACtion', () => {
  it('should create an action to set all user teams', () => {
    const payload = [{ id: 1, name: 'Team 1' }, { id: 2, name: 'Team 2' }];
    const expectedAction = {
      type: RECEIVE_ALL_USER_TEAMS,
      payload,
    };
    expect(teamMembersFectchACtion(payload)).toEqual(expectedAction);
  });
});
