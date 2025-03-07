import httpService from '../services/httpService';
import axios from 'axios';
import { ApiEndpoint } from '../utils/URL';
import { ENDPOINTS } from '../utils/URL';


const APIEndpoint = ApiEndpoint;

export function clearUserProfile() {
  return { type: 'CLEAR_USER_PROFILE' };
};

export function getUserTeamMembers(userId) {
  const request = httpService.get(`${APIEndpoint}/userprofile/teammembers/${userId}`);

  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_USER_TEAM_MEMBERS',
        payload: data,
      });
    });
  };
};

export function getUserProjectMembers(projectId) {
  const request = httpService.get(`${APIEndpoint}/userprofile/project/${projectId}`);

  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_USER_PROJECT_MEMBERS',
        payload: data,
      });
    });
  };
};

export function getDashboardData(userId) {
  const request = httpService.get(`${APIEndpoint}/dashboard/${userId}`);

  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_DASHBOARD_DATA',
        payload: data,
      });
    });
  };
};

export function getWeeklyDashboardData(userId, fromDate, toDate) {
  const request = httpService.get(
    `${APIEndpoint}/dashboard/weeklydata/${userId}/${fromDate}/${toDate}`,
  );

  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_WEEKLY_DASHBOARD_DATA',
        payload: data,
      });
    });
  };
};

export function getMonthlyDashboardData(userId, fromDate, toDate) {
  const request = httpService.get(
    `${APIEndpoint}/dashboard/monthlydata/${userId}/${fromDate}/${toDate}`,
  );

  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_MONTHLY_DASHBOARD_DATA',
        payload: data,
      });
    });
  };
};

export function getLeaderboardData(userId) {
  const request = httpService.get(`${APIEndpoint}/dashboard/leaderboard/${userId}`);

  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_LEADERBOARD_DATA',
        payload: data,
      });
    });
  };
};

export function getActionItems(userId) {
  const request = httpService.get(`${APIEndpoint}/actionItem/user/${userId}`);

  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_ACTION_ITEMS',
        payload: data,
      });
    });
  };
};

export function getNotifications(userId) {
  const request = httpService.get(`${APIEndpoint}/notification/user/${userId}`);

  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_NOTIFICATIONS',
        payload: data,
      });
    });
  };
};

export function getAllProjects() {
  const request = httpService.get(`${APIEndpoint}/projects`);

  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_ALL_PROJECTS',
        payload: data,
      });
    });
  };
};

export function getProjectById(projectId) {
  const request = httpService.get(`${APIEndpoint}/project/${projectId}`);

  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_PROJECT_BY_ID',
        payload: data,
      });
    });
  };
};

export function getProjectsByUser(userId) {
  const request = httpService.get(`${APIEndpoint}/projects/user/${userId}`);

  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_PROJECTS_BY_USER',
        payload: data,
      });
    });
  };
};

export function getProjectMembership(projectId) {
  const request = httpService.get(`${APIEndpoint}/project/${projectId}/users`);

  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_PROJECT_MEMBERSHIP',
        payload: data,
      });
    });
  };
};

export function getAllTeams() {
  const request = httpService.get(`${APIEndpoint}/team`);
  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_ALL_TEAMS',
        payload: data,
      });
    });
  };
};

export function getTeamById(teamId) {
  const request = httpService.get(`${APIEndpoint}/team/${teamId}`);

  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_TEAM_BY_ID',
        payload: data,
      });
    });
  };
};

export function getTeamMembership(teamId) {
  const request = httpService.get(`${APIEndpoint}/team/${teamId}/users`);

  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_TEAM_MEMBERSHIP',
        payload: data,
      });
    });
  };
};

export function getAllTimeEntries() {
  const request = httpService.get(`${APIEndpoint}/TimeEntry`);

  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_ALL_TIME_ENTRIES',
        payload: data,
      });
    });
  };
};

export function getTimeEntryForSpecifiedPeriod(userId, fromDate, toDate) {
  const request = httpService.get(`${APIEndpoint}/TimeEntry/user/${userId}/${fromDate}/${toDate}`);

  return dispatch => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD',
        payload: data,
      });
    });
  };
};

export function postTimeEntry(timeEntryObj) {
  const request = httpService.post(`${APIEndpoint}/TimeEntry`, timeEntryObj);
  return dispatch => {
    request.then(
      response => dispatch({ type: 'REQUEST_SUCCEEDED', payload: response }),
      error => dispatch({ type: 'REQUEST_FAILED', error }),
    );
  };
};

export function getTimeEntryByProjectSpecifiedPeriod(projectId, fromDate, toDate) {
  const request = httpService.get(`${APIEndpoint}/TimeEntry/projects/${projectId}/${fromDate}/${toDate}`);

  return dispatch => {
    return new Promise((resolve, reject) => {
      request.then(({ data }) => {
        dispatch({
          type: 'GET_TIME_ENTRY_By_Project_FOR_SPECIFIED_PERIOD',
          payload: data,
        });
        resolve(data);
      }).catch(error => {
        reject(error);
      });
    });
  };
};

export function getTimeEntryForOverDate(users, fromDate, toDate) {

  const url = ENDPOINTS.TIME_ENTRIES_USER_LIST;

  return axios.post(url, { users, fromDate, toDate })
  .then(response => response.data)
  .catch(error => {
    throw error;
  });
}
