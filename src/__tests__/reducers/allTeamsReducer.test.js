import { allUserTeamsReducer } from '../../reducers/allTeamsReducer';
import * as types from '../../constants/allTeamsConstants';

const fetched = (stuff) => {
  return {
    ...stuff,
    fetching: false,
    fetched: true,
    status: '200',
  };
};

describe('Teams Reducer', () => {
  it('start fetch', () => {
    const result = allUserTeamsReducer({}, { type: types.FETCH_USER_TEAMS_START });
    expect(result).toMatchObject({
      fetching: true,
      status: '200',
    });
  });

  it('fetch error', () => {
    const result = allUserTeamsReducer({}, { type: types.FETCH_USER_TEAMS_ERROR });
    expect(result).toMatchObject({
      fetching: false,
      status: '404',
    });
  });

  it('get teams', () => {
    const result = allUserTeamsReducer(
      {
        allTeams: 'before',
      },
      {
        type: types.RECEIVE_ALL_USER_TEAMS,
        payload: 'after',
      },
    );
    expect(result).toMatchObject(
      fetched({
        allTeams: 'after',
      }),
    );
  });

  it('add team', () => {
    const result = allUserTeamsReducer(
      {
        allTeams: ['teams'],
      },
      {
        type: types.ADD_NEW_TEAM,
        payload: 'new',
      },
    );
    expect(result).toMatchObject(
      fetched({
        allTeams: ['teams', 'new'],
      }),
    );
  });

  it('update user team', () => {
    const result = allUserTeamsReducer(
      {
        allTeams: [{ _id: 0 }, { _id: 42 }, { _id: 100 }],
      },
      {
        type: types.USER_TEAMS_UPDATE,
        team: { _id: 42, name: 'set' },
      },
    );
    expect(result).toMatchObject(
      fetched({
        allTeams: [{ _id: 0 }, { _id: 42, name: 'set' }, { _id: 100 }],
      }),
    );
  });

  it('delete team', () => {
    const result = allUserTeamsReducer(
      {
        allTeams: [{ _id: 0 }, { _id: 42 }, { _id: 100 }],
      },
      {
        type: types.TEAMS_DELETE,
        team: 42,
      },
    );
    expect(result).toMatchObject(
      fetched({
        allTeams: [{ _id: 0 }, { _id: 100 }],
      }),
    );
  });

  it('update team', () => {
    const result = allUserTeamsReducer(
      {
        allTeams: [{ _id: 0 }, { _id: 42 }, { _id: 100 }],
      },
      {
        type: types.UPDATE_TEAM,
        teamId: 42,
        teamName: 'name',
        isActive: true,
      },
    );
    expect(result).toMatchObject(
      fetched({
        allTeams: [{ _id: 0 }, { _id: 42, teamName: 'name', isActive: true }, { _id: 100 }],
      }),
    );
  });
});
