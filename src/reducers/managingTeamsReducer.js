import { RECEIVE_TEAMS, FETCH_TEAMS_ERROR } from '../constants/teams';
import { FETCH_PROJECTS_START } from '../constants/projects';

const managingTeamsInitial = {
  fetching: false,
  fetched: false,
  teams: [],
  status: '404',
};

const updateObject = (oldObject, updatedProperties) => ({
  ...oldObject,
  ...updatedProperties,
});

// eslint-disable-next-line import/prefer-default-export,default-param-last
export const managingTeamsReducer = (managingTeams = managingTeamsInitial, action) => {
  switch (action.type) {
    case FETCH_PROJECTS_START:
      return { ...managingTeams, fetching: true, status: '200' };
    case RECEIVE_TEAMS:
      return updateObject(managingTeams, {
        teams: action.payload,
        fetching: false,
        fetched: true,
        status: '200',
      });
    case FETCH_TEAMS_ERROR:
      // eslint-disable-next-line no-console
      console.error('managingTeamsReducer Error: ', action.payload);
      return { ...managingTeams, fetching: false, status: action.payload };
    default:
      return managingTeams;
  }
};
