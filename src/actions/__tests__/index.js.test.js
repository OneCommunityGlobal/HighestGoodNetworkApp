import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';


import httpService from '../../services/httpService';
import {
  clearUserProfile,
  getUserTeamMembers,
  getUserProjectMembers,
  getDashboardData,
  getActionItems,
  getNotifications,
  getAllProjects,
  getProjectById,
  getProjectsByUser,
  getProjectMembership,
  getAllTeams,
  getTeamById,
  getTeamMembership,
  getAllTimeEntries,
  getTimeEntryForSpecifiedPeriod,
  postTimeEntry,
  getTimeEntryByProjectSpecifiedPeriod,
  getTimeEntryForOverDate,
} from '../index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

vi.mock('../../services/httpService');
vi.mock('axios');

// Add this to fix "setImmediate is not defined" error
// vi runs in JSDom environment by default which doesn't have setImmediate
global.setImmediate = vi.fn(callback => callback());

describe('clearUserProfile action', () => {
  it('should create an action to clear user profile', () => {
    const expectedAction = {
      type: 'CLEAR_USER_PROFILE',
    };
    expect(clearUserProfile()).toEqual(expectedAction);
  });
});

describe('getUserTeamMembers action', () => {
  it('should create an action to get user team members', async () => {
    const userId = '123';
    const mockData = { teamMembers: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [{ type: 'GET_USER_TEAM_MEMBERS', payload: mockData }];

    const store = mockStore({});

    // Use async/await approach instead of setImmediate
    await store.dispatch(getUserTeamMembers(userId));
    // Wait for promises to resolve
    await new Promise(process.nextTick);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('getUserProjectMembers action', () => {
  it('should create an action to get user project members', async () => {
    const projectId = '456';
    const mockData = { projectMembers: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [{ type: 'GET_USER_PROJECT_MEMBERS', payload: mockData }];

    const store = mockStore({});

    await store.dispatch(getUserProjectMembers(projectId));
    await new Promise(process.nextTick);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('getDashboardData action', () => {
  it('should create an action to get dashboard data', async () => {
    const userId = '789';
    const mockData = { dashboardData: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [{ type: 'GET_DASHBOARD_DATA', payload: mockData }];

    const store = mockStore({});

    await store.dispatch(getDashboardData(userId));
    await new Promise(process.nextTick);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('getActionItems action', () => {
  it('should create an action to get action items', async () => {
    const userId = '101';
    const mockData = { actionItems: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [{ type: 'GET_ACTION_ITEMS', payload: mockData }];

    const store = mockStore({});

    await store.dispatch(getActionItems(userId));
    await new Promise(process.nextTick);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('getNotifications action', () => {
  it('should create an action to get notifications', async () => {
    const userId = '202';
    const mockData = { notifications: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [{ type: 'GET_NOTIFICATIONS', payload: mockData }];

    const store = mockStore({});

    await store.dispatch(getNotifications(userId));
    await new Promise(process.nextTick);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('getAllProjects action', () => {
  it('should create an action to get all projects', async () => {
    const mockData = { projects: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [{ type: 'GET_ALL_PROJECTS', payload: mockData }];

    const store = mockStore({});

    await store.dispatch(getAllProjects());
    await new Promise(process.nextTick);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('getProjectById action', () => {
  it('should create an action to get project by id', async () => {
    const projectId = '303';
    const mockData = { project: {} };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [{ type: 'GET_PROJECT_BY_ID', payload: mockData }];

    const store = mockStore({});

    await store.dispatch(getProjectById(projectId));
    await new Promise(process.nextTick);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('getProjectsByUser action', () => {
  it('should create an action to get projects by user', async () => {
    const userId = '404';
    const mockData = { projects: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [{ type: 'GET_PROJECTS_BY_USER', payload: mockData }];

    const store = mockStore({});

    await store.dispatch(getProjectsByUser(userId));
    await new Promise(process.nextTick);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('getProjectMembership action', () => {
  it('should create an action to get project membership', async () => {
    const projectId = '505';
    const mockData = { members: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [{ type: 'GET_PROJECT_MEMBERSHIP', payload: mockData }];

    const store = mockStore({});

    await store.dispatch(getProjectMembership(projectId));
    await new Promise(process.nextTick);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('getAllTeams action', () => {
  it('should create an action to get all teams', async () => {
    const mockData = { teams: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [{ type: 'GET_ALL_TEAMS', payload: mockData }];

    const store = mockStore({});

    await store.dispatch(getAllTeams());
    await new Promise(process.nextTick);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('getTeamById action', () => {
  it('should create an action to get team by id', async () => {
    const teamId = '606';
    const mockData = { team: {} };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [{ type: 'GET_TEAM_BY_ID', payload: mockData }];

    const store = mockStore({});

    await store.dispatch(getTeamById(teamId));
    await new Promise(process.nextTick);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('getTeamMembership action', () => {
  it('should create an action to get team membership', async () => {
    const teamId = '707';
    const mockData = { members: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [{ type: 'GET_TEAM_MEMBERSHIP', payload: mockData }];

    const store = mockStore({});

    await store.dispatch(getTeamMembership(teamId));
    await new Promise(process.nextTick);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('getAllTimeEntries action', () => {
  it('should create an action to get all time entries', async () => {
    const mockData = { timeEntries: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [{ type: 'GET_ALL_TIME_ENTRIES', payload: mockData }];

    const store = mockStore({});

    await store.dispatch(getAllTimeEntries());
    await new Promise(process.nextTick);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('getTimeEntryForSpecifiedPeriod action', () => {
  it('should create an action to get time entry for specified period', async () => {
    const userId = '808';
    const fromDate = '2021-01-01';
    const toDate = '2021-01-31';
    const mockData = { timeEntries: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [{ type: 'GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD', payload: mockData }];

    const store = mockStore({});

    await store.dispatch(getTimeEntryForSpecifiedPeriod(userId, fromDate, toDate));
    await new Promise(process.nextTick);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('postTimeEntry action', () => {
  it('should create an action to post time entry', async () => {
    const timeEntryObj = { description: 'Worked on project' };
    const mockResponse = { data: { id: '909' } };
    httpService.post.mockResolvedValue(mockResponse);

    const expectedActions = [{ type: 'REQUEST_SUCCEEDED', payload: mockResponse }];

    const store = mockStore({});

    await store.dispatch(postTimeEntry(timeEntryObj));
    await new Promise(process.nextTick);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('getTimeEntryByProjectSpecifiedPeriod action', () => {
  it('should create an action to get time entry by project for specified period', () => {
    const projectId = '1010';
    const fromDate = '2021-01-01';
    const toDate = '2021-01-31';
    const mockData = { timeEntries: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [
      { type: 'GET_TIME_ENTRY_By_Project_FOR_SPECIFIED_PERIOD', payload: mockData },
    ];

    const store = mockStore({});

    return store
      .dispatch(getTimeEntryByProjectSpecifiedPeriod(projectId, fromDate, toDate))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });
});

describe('getTimeEntryForOverDate action', () => {
  it('should create an action to get time entry for over date', async () => {
    const users = ['user1', 'user2'];
    const fromDate = '2021-01-01';
    const toDate = '2021-01-31';
    const mockData = { timeEntries: [] };
    axios.post.mockResolvedValue({ data: mockData });

    const result = await getTimeEntryForOverDate(users, fromDate, toDate);
    expect(result).toEqual(mockData);
  });
});
