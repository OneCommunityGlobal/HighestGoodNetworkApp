import { managingTeamsReducer } from '../managingTeamsReducer';
import { FETCH_PROJECTS_START } from '../../constants/projects';
import { RECEIVE_TEAMS, FETCH_TEAMS_ERROR } from '../../constants/teams';

const initialState = {
  fetching: false,
  fetched: false,
  teams: [],
  status: '404',
};

describe('Managing Teams Reducer', () => {
  
  it('should return the initial state when an action type is not passed', () => {
    
    const result = managingTeamsReducer(undefined, {});
    expect(result).toEqual(initialState);

  });

  it('fetching project start', () => {
    const result = managingTeamsReducer({}, { type: FETCH_PROJECTS_START });
    expect(result).toMatchObject({
      fetching: true,
      status: '200',
    });
  });

  it('receiving teams',() => {
    const result = managingTeamsReducer({}, {type: RECEIVE_TEAMS});
    expect(result).toMatchObject({
      fetching: false,
      fetched: true,
      status: '200',
    });
  });

  it('fetching teams error',() => {
    const result = managingTeamsReducer({}, {type: FETCH_TEAMS_ERROR});
    expect(result).toMatchObject({
      fetching: false
    });
  });

});