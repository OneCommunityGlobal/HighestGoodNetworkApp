import { userTeamMembersReducer } from '../userTeamMembersReducer';

describe('userTeamMembersReducer', () => {
  const initialState = null;

  it('should return the initial state when no action is provided', () => {
    const result = userTeamMembersReducer(undefined, {});
    expect(result).toEqual(initialState);
  });

  it('should handle GET_USER_TEAM_MEMBERS action', () => {
    const action = {
      type: 'GET_USER_TEAM_MEMBERS',
      payload: [
        { id: 1, name: 'Member 1' },
        { id: 2, name: 'Member 2' },
      ],
    };

    const expectedState = action.payload;

    const result = userTeamMembersReducer(initialState, action);
    expect(result).toEqual(expectedState);
  });

  it('should return the same state for unknown action types', () => {
    const unknownAction = { type: 'UNKNOWN_ACTION' };
    const result = userTeamMembersReducer(initialState, unknownAction);
    expect(result).toEqual(initialState);
  });

  it('should return null if the team members state is null', () => {
    const action = {
      type: 'GET_USER_TEAM_MEMBERS',
      payload: [{ id: 1, name: 'New Member' }],
    };

    const result = userTeamMembersReducer(null, action);
    expect(result).toEqual(action.payload);
  });
});