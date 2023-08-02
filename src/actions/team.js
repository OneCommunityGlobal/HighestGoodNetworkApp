import moment from 'moment';
import { uniqBy } from 'lodash';
import axios from 'axios';
import httpService from '../services/httpService';
import { FETCH_TEAMS_START, RECEIVE_TEAMS, FETCH_TEAMS_ERROR } from '../constants/teams';
import { ENDPOINTS } from '../utils/URL';
import { GET_TEAM_BY_ID } from '../constants/team';
import {
  GET_USER_PROFILE,
  getUserProfile as getUserProfileActionCreator,
} from '../constants/userProfile';

export function getUserTeamMembers1(userId) {
  const request = httpService.get(ENDPOINTS.USER_TEAM(userId));

  return dispatch => {
    request.then(({ data }) => {
      console.log('data', data);
      dispatch({
        type: 'GET_USER_TEAM_MEMBERS',
        payload: data,
      });
    });
  };
}

export const getUserTeamMembers = userId => {
  const url = ENDPOINTS.USER_TEAM(userId);
  return async dispatch => {
    const res = await httpService.get(url);
  };
};

export const fetchAllManagingTeams = (userId, managingTeams) => {
  const allManagingTeams = [];
  let allMembers = [];
  const teamMembersPromises = [];
  const memberTimeEntriesPromises = [];
  managingTeams.forEach(team => {
    teamMembersPromises.push(httpService.get(ENDPOINTS.TEAM_MEMBERS(team._id)));
  });

  Promise.all(teamMembersPromises).then(data => {
    for (let i = 0; i < managingTeams.length; i++) {
      allManagingTeams[i] = {
        ...managingTeams[i],
        members: data[i].data,
      };
      allMembers = allMembers.concat(data[i].data);
    }
    console.log('allManagingTeams:', allManagingTeams);
    const uniqueMembers = uniqBy(allMembers, '_id');
    uniqueMembers.forEach(async member => {
      const fromDate = moment()
        .startOf('week')
        .subtract(0, 'weeks');
      const toDate = moment()
        .endOf('week')
        .subtract(0, 'weeks');
      memberTimeEntriesPromises.push(
        httpService
          .get(ENDPOINTS.TIME_ENTRIES_PERIOD(member._id, fromDate, toDate))
          .catch(err => {}),
      );
    });

    Promise.all(memberTimeEntriesPromises).then(data => {
      for (let i = 0; i < uniqueMembers.length; i++) {
        uniqueMembers[i] = {
          ...uniqueMembers[i],
          timeEntries: data[i].data,
        };
      }

      for (let i = 0; i < allManagingTeams.length; i++) {
        for (let j = 0; j < allManagingTeams[i].members.length; j++) {
          const memberDataWithTimeEntries = uniqueMembers.find(
            member => member._id === allManagingTeams[i].members[j]._id,
          );
          allManagingTeams[i].members[j] = memberDataWithTimeEntries;
        }
      }
    });
  });

  return async dispatch => {
    await dispatch(setTeamsStart());
    try {
      dispatch(setTeams(allManagingTeams));
    } catch (err) {
      console.error(err);
      dispatch(setTeamsError(err));
    }
  };
};

const setTeamsStart = () => ({
  type: FETCH_TEAMS_START,
});

const setTeams = payload => ({
  type: RECEIVE_TEAMS,
  payload,
});

const setTeamsError = payload => ({
  type: FETCH_TEAMS_ERROR,
  payload,
});

export const getTeamDetail = teamId => {
  const url = ENDPOINTS.TEAM_BY_ID(teamId);
  return async dispatch => {
    let loggedOut = false;
    const res = await axios.get(url).catch(error => {
      if (error.status === 401) {
        // logout error
        loggedOut = true;
      }
    });
    if (!loggedOut) {
      await dispatch(setTeamDetail(res.data));
    }
  };
};

export const setTeamDetail = data => ({
  type: GET_TEAM_BY_ID,
  payload: data,
});
