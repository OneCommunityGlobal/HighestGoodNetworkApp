import { clearUserProfile, getUserTeamMembers, getUserProjectMembers, getDashboardData, getActionItems, getNotifications, getAllProjects, getProjectById, getProjectsByUser, getProjectMembership, getAllTeams, getTeamById, getTeamMembership, getAllTimeEntries, getTimeEntryForSpecifiedPeriod, postTimeEntry, getTimeEntryByProjectSpecifiedPeriod, getTimeEntryForOverDate } from '../index';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import httpService from '../../services/httpService';
import axios from 'axios'; // Add this import

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../../services/httpService');
jest.mock('axios'); // Mock axios

describe('clearUserProfile action', () => {
  it('should create an action to clear user profile', () => {
    const expectedAction = {
      type: 'CLEAR_USER_PROFILE',
    };
    expect(clearUserProfile()).toEqual(expectedAction);
  });
});

describe('getUserTeamMembers action', () => {
  it('should create an action to get user team members', () => {
    const userId = '123';
    const mockData = { teamMembers: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [
      { type: 'GET_USER_TEAM_MEMBERS', payload: mockData },
    ];

    const store = mockStore({});

    store.dispatch(getUserTeamMembers(userId));
    setImmediate(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('getUserProjectMembers action', () => {
  it('should create an action to get user project members', () => {
    const projectId = '456';
    const mockData = { projectMembers: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [
      { type: 'GET_USER_PROJECT_MEMBERS', payload: mockData },
    ];

    const store = mockStore({});

    store.dispatch(getUserProjectMembers(projectId));
    setImmediate(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('getDashboardData action', () => {
  it('should create an action to get dashboard data', () => {
    const userId = '789';
    const mockData = { dashboardData: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [
      { type: 'GET_DASHBOARD_DATA', payload: mockData },
    ];

    const store = mockStore({});

    store.dispatch(getDashboardData(userId));
    setImmediate(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('getActionItems action', () => {
  it('should create an action to get action items', () => {
    const userId = '101';
    const mockData = { actionItems: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [
      { type: 'GET_ACTION_ITEMS', payload: mockData },
    ];

    const store = mockStore({});

    store.dispatch(getActionItems(userId));
    setImmediate(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('getNotifications action', () => {
  it('should create an action to get notifications', () => {
    const userId = '202';
    const mockData = { notifications: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [
      { type: 'GET_NOTIFICATIONS', payload: mockData },
    ];

    const store = mockStore({});

    store.dispatch(getNotifications(userId));
    setImmediate(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('getAllProjects action', () => {
  it('should create an action to get all projects', () => {
    const mockData = { projects: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [
      { type: 'GET_ALL_PROJECTS', payload: mockData },
    ];

    const store = mockStore({});

    store.dispatch(getAllProjects());
    setImmediate(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('getProjectById action', () => {
  it('should create an action to get project by id', () => {
    const projectId = '303';
    const mockData = { project: {} };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [
      { type: 'GET_PROJECT_BY_ID', payload: mockData },
    ];

    const store = mockStore({});

    store.dispatch(getProjectById(projectId));
    setImmediate(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('getProjectsByUser action', () => {
  it('should create an action to get projects by user', () => {
    const userId = '404';
    const mockData = { projects: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [
      { type: 'GET_PROJECTS_BY_USER', payload: mockData },
    ];

    const store = mockStore({});

    store.dispatch(getProjectsByUser(userId));
    setImmediate(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('getProjectMembership action', () => {
  it('should create an action to get project membership', () => {
    const projectId = '505';
    const mockData = { members: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [
      { type: 'GET_PROJECT_MEMBERSHIP', payload: mockData },
    ];

    const store = mockStore({});

    store.dispatch(getProjectMembership(projectId));
    setImmediate(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('getAllTeams action', () => {
  it('should create an action to get all teams', () => {
    const mockData = { teams: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [
      { type: 'GET_ALL_TEAMS', payload: mockData },
    ];

    const store = mockStore({});

    store.dispatch(getAllTeams());
    setImmediate(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('getTeamById action', () => {
  it('should create an action to get team by id', () => {
    const teamId = '606';
    const mockData = { team: {} };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [
      { type: 'GET_TEAM_BY_ID', payload: mockData },
    ];

    const store = mockStore({});

    store.dispatch(getTeamById(teamId));
    setImmediate(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('getTeamMembership action', () => {
  it('should create an action to get team membership', () => {
    const teamId = '707';
    const mockData = { members: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [
      { type: 'GET_TEAM_MEMBERSHIP', payload: mockData },
    ];

    const store = mockStore({});

    store.dispatch(getTeamMembership(teamId));
    setImmediate(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('getAllTimeEntries action', () => {
  it('should create an action to get all time entries', () => {
    const mockData = { timeEntries: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [
      { type: 'GET_ALL_TIME_ENTRIES', payload: mockData },
    ];

    const store = mockStore({});

    store.dispatch(getAllTimeEntries());
    setImmediate(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('getTimeEntryForSpecifiedPeriod action', () => {
  it('should create an action to get time entry for specified period', () => {
    const userId = '808';
    const fromDate = '2021-01-01';
    const toDate = '2021-01-31';
    const mockData = { timeEntries: [] };
    httpService.get.mockResolvedValue({ data: mockData });

    const expectedActions = [
      { type: 'GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD', payload: mockData },
    ];

    const store = mockStore({});

    store.dispatch(getTimeEntryForSpecifiedPeriod(userId, fromDate, toDate));
    setImmediate(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

describe('postTimeEntry action', () => {
  it('should create an action to post time entry', () => {
    const timeEntryObj = { description: 'Worked on project' };
    const mockResponse = { data: { id: '909' } };
    httpService.post.mockResolvedValue(mockResponse);

    const expectedActions = [
      { type: 'REQUEST_SUCCEEDED', payload: mockResponse },
    ];

    const store = mockStore({});

    store.dispatch(postTimeEntry(timeEntryObj));
    setImmediate(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
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

    return store.dispatch(getTimeEntryByProjectSpecifiedPeriod(projectId, fromDate, toDate)).then(() => {
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
