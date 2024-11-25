import moment from 'moment';
import { uniqBy } from 'lodash';
import axios from 'axios';
import httpService from '../services/httpService';
import {
  FETCH_TEAMS_START,
  RECEIVE_TEAMS,
  FETCH_TEAMS_ERROR,
} from '../constants/teams';
import { GET_TEAM_BY_ID } from '../constants/team';
import { ENDPOINTS } from '../utils/URL';

/** *****************************************
 * ACTION CREATORS
 ****************************************** */

/**
 * Set a flag that fetching teams
 */
const setTeamsStart = () => ({
  type: FETCH_TEAMS_START,
});

/**
 * Set Teams in store
 * @param {Array} payload - Array of teams
 */
const setTeams = (payload) => ({
  type: RECEIVE_TEAMS,
  payload,
});

/**
 * Error when setting teams
 * @param {Object} payload - Error object
 */
const setTeamsError = (payload) => ({
  type: FETCH_TEAMS_ERROR,
  payload,
});

/**
 * Set Team Detail in store
 * @param {Object} data - Team detail
 */
const setTeamDetail = (data) => ({
  type: GET_TEAM_BY_ID,
  payload: data,
});

/**
 * Fetch User Team Members
 */
export function getUserTeamMembers1(userId) {
  const request = httpService.get(ENDPOINTS.USER_TEAM(userId));

  return (dispatch) => {
    request.then(({ data }) => {
      dispatch({
        type: 'GET_USER_TEAM_MEMBERS',
        payload: data,
      });
    });
  };
}

export const getUserTeamMembers = (userId) => {
  const url = ENDPOINTS.USER_TEAM(userId);
  return async (dispatch) => {
    try {
      const res = await httpService.get(url);
      // Handle response if needed
    } catch (error) {
      // Handle error if needed
    }
  };
};

export const fetchAllManagingTeams = (userId, managingTeams) => {
  const allManagingTeams = [];
  let allMembers = [];
  const teamMembersPromises = [];
  const memberTimeEntriesPromises = [];

  managingTeams.forEach((team) => {
    teamMembersPromises.push(httpService.get(ENDPOINTS.TEAM_MEMBERS(team._id)));
  });

  Promise.all(teamMembersPromises).then((responses) => {
    for (let i = 0; i < managingTeams.length; i += 1) {
      allManagingTeams[i] = {
        ...managingTeams[i],
        members: responses[i].data,
      };
      allMembers = allMembers.concat(responses[i].data);
    }

    const uniqueMembers = uniqBy(allMembers, '_id');
    uniqueMembers.forEach(async (member) => {
      const fromDate = moment().startOf('week').subtract(0, 'weeks');
      const toDate = moment().endOf('week').subtract(0, 'weeks');
      memberTimeEntriesPromises.push(
        httpService
          .get(ENDPOINTS.TIME_ENTRIES_PERIOD(member._id, fromDate, toDate))
          .catch(() => {})
      );
    });

    Promise.all(memberTimeEntriesPromises).then((timeEntries) => {
      for (let i = 0; i < uniqueMembers.length; i += 1) {
        uniqueMembers[i] = {
          ...uniqueMembers[i],
          timeEntries: timeEntries[i].data,
        };
      }

      for (let i = 0; i < allManagingTeams.length; i += 1) {
        for (let j = 0; j < allManagingTeams[i].members.length; j += 1) {
          const memberDataWithTimeEntries = uniqueMembers.find(
            (member) => member._id === allManagingTeams[i].members[j]._id
          );
          allManagingTeams[i].members[j] = memberDataWithTimeEntries;
        }
      }
    });
  });

  return async (dispatch) => {
    await dispatch(setTeamsStart());
    try {
      dispatch(setTeams(allManagingTeams));
    } catch (error) {
      dispatch(setTeamsError(error));
    }
  };
};

export const getTeamDetail = (teamId) => {
  const url = ENDPOINTS.TEAM_BY_ID(teamId);
  return async (dispatch) => {
    try {
      const res = await axios.get(url);
      await dispatch(setTeamDetail(res.data));
    } catch (error) {
      // Handle error if needed
    }
  };
};
