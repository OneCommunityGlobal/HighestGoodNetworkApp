import { leaderboardDataReducer } from '../leaderboardDataReducer';

describe('leaderboardDataReducer', () => {
  it('should return default state when no action is passed', () => {
    const initialState = [];
    const newState = leaderboardDataReducer(undefined, {});
    expect(newState).toEqual(initialState);
  });

  it('should return updated state when GET_LEADERBOARD_DATA action is passed', () => {
    const action = {
      type: 'GET_LEADERBOARD_DATA',
      payload: [{ name: 'John', score: 100 }, { name: 'Doe', score: 90 }],
    };
    const newState = leaderboardDataReducer([], action);
    expect(newState).toEqual(action.payload);
  });

  it('should not mutate state when unknown action type is passed', () => {
    const initialState = [{ name: 'John', score: 100 }];
    const action = { type: 'UNKNOWN_ACTION', payload: [] };
    const newState = leaderboardDataReducer(initialState, action);
    expect(newState).toEqual(initialState);
  });
});



import { orgDataReducer } from '../leaderboardDataReducer';

describe('orgDataReducer', () => {
  it('should return default state when no action is passed', () => {
    const initialState = {};
    const newState = orgDataReducer(undefined, {});
    expect(newState).toEqual(initialState);
  });

  it('should return updated state when GET_ORG_DATA action is passed', () => {
    const action = {
      type: 'GET_ORG_DATA',
      payload: { id: 1, name: 'Organization' },
    };
    const newState = orgDataReducer({}, action);
    expect(newState).toEqual(action.payload);
  });

  it('should not mutate state when unknown action type is passed', () => {
    const initialState = { id: 1, name: 'Organization' };
    const action = { type: 'UNKNOWN_ACTION', payload: {} };
    const newState = orgDataReducer(initialState, action);
    expect(newState).toEqual(initialState);
  });
});
