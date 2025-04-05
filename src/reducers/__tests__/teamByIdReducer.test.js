import { teamByIdReducer } from '../teamByIdReducer';
import { GET_TEAM_BY_ID } from '../../constants/team';


describe('teamByIdReducer', () => {
  it('should return the initial state when state is undefined', () => {
    const initialState = null;
    const action = {};
    expect(teamByIdReducer(undefined, action)).toBe(initialState);
  });

  it('should return the current state when action type does not match', () => {
    const currentState = { id: 1, name: 'Team A' };
    const action = { type: 'UNKNOWN_ACTION', payload: { id: 2, name: 'Team B' } };
    expect(teamByIdReducer(currentState, action)).toBe(currentState);
  });

  it('should return the new state when action type is GET_TEAM_BY_ID', () => {
    const action = { type: GET_TEAM_BY_ID, payload: { id: 2, name: 'Team B' } };
    expect(teamByIdReducer(null, action)).toEqual(action.payload);
  });

  it('should update the state with the new team when action type is GET_TEAM_BY_ID', () => {
    const currentState = { id: 1, name: 'Team A' };
    const action = { type: GET_TEAM_BY_ID, payload: { id: 2, name: 'Team B' } };
    expect(teamByIdReducer(currentState, action)).toEqual(action.payload);
  });
});