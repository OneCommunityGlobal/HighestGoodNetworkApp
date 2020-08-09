import moment from 'moment';
import _ from 'lodash';
import httpService from '../services/httpService';
import { FETCH_TEAMS_START, RECEIVE_TEAMS, FETCH_TEAMS_ERROR } from '../constants/teams';
import { ENDPOINTS } from '../utils/URL';

export function getUserTeamMembers1(userId) {
  const request = httpService.get(ENDPOINTS.USER_TEAM(userId));

  return (dispatch) => {
    request.then(({ data }) => {
      console.log('data', data);
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
    const res = await httpService.get(url);
    // await dispatch(getUserProfileActionCreator(res.data))
  };
};

export const fetchAllManagingTeams = (userId, managingTeams) => {
  const allManagingTeams = [];
  let allMembers = [];
  const teamMembersPromises = [];
  const memberTimeEntriesPromises = [];
  managingTeams.forEach(async (team) => {
    // req = await httpService.get(ENDPOINTS.TEAM_MEMBERS(team._id));
    teamMembersPromises.push(httpService.get(ENDPOINTS.TEAM_MEMBERS(team._id)));
  });

  console.log('managingTeams:', managingTeams);

  Promise.all(teamMembersPromises).then((data) => {
    console.log('after promises:', data);
    for (let i = 0; i < managingTeams.length; i++) {
      allManagingTeams[i] = {
        ...managingTeams[i],
        members: data[i].data,
      };
      allMembers = allMembers.concat(data[i].data);
    }
    console.log('allManagingTeams:', allManagingTeams);
    const uniqueMembers = _.uniqBy(allMembers, '_id');
    console.log('uniq:', uniqueMembers);
    uniqueMembers.forEach(async (member) => {
      const fromDate = moment()
        .startOf('week')
        .subtract(0, 'weeks');
      const toDate = moment()
        .endOf('week')
        .subtract(0, 'weeks');
      memberTimeEntriesPromises.push(
        httpService.get(ENDPOINTS.TIME_ENTRIES_PERIOD(member._id, fromDate, toDate))
      );
    });

    Promise.all(memberTimeEntriesPromises).then((data) => {
      console.log('After time entries: ', data);
    });
  });

  // const allUniqueMembers = _.uniqBy(allMembers, '_id');
  // console.log('allUniqueMembers: ', allUniqueMembers);

  // console.log('allManagingTeams:', allManagingTeams);

  // allManagingTeams.forEach((team) => {
  //   console.log('squad');
  //   team.members.forEach(async (member, index) => {
  //     const fromDate = moment()
  //       .startOf('week')
  //       .subtract(0, 'weeks');
  //     const toDate = moment()
  //       .endOf('week')
  //       .subtract(0, 'weeks');
  //     req = await httpService.get(
  //       ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, toDate)
  //     );
  //     console.log(req);
  //     team.members[index].push({ ...member, timeEntries: req.data });
  //   });
  // });

  return async (dispatch) => {
    await dispatch(setTeamsStart());
    try {
      dispatch(setTeams(allManagingTeams));
    } catch (err) {
      console.error(err);
      dispatch(setTeamsError());
    }
  };
};

const setTeamsStart = () => ({
  type: FETCH_TEAMS_START,
});

const setTeams = (payload) => ({
  type: RECEIVE_TEAMS,
  payload,
});

const setTeamsError = (payload) => ({
  type: FETCH_TEAMS_ERROR,
  payload,
});
