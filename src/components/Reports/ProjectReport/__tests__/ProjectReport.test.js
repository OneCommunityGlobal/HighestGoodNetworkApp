import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import ProjectReport from '..';
import axios from 'axios';
import { getProjectDetail } from 'actions/project';
import { fetchAllMembers, foundUsers, getProjectActiveUser } from 'actions/projectMembers';
import { fetchAllWBS } from 'actions/wbs';

const mockStore = configureStore([thunk]);
const store = mockStore({
  auth: {
    user: {
      role: 'Administrator',
    },
  },
  wbs: { WBSItems: [] },
  projectMembers: { members: [], foundUsers: [], fetched: true },
  tasks: [],
  projectReport: {
    project: {
      projectName: 'project 1',
      isLoading: false,
      isActive: false,
    },
  },
});

jest.mock('axios');
afterEach(() => {
  store.clearActions();
});
const flushAllPromises = () => new Promise(setImmediate);

describe('ProjectReport component', () => {
  it('renders without crashing', () => {
    axios.get.mockResolvedValue({
      status: 200,
    });
    render(
      <Provider store={store}>
        <ProjectReport />
      </Provider>,
    );
  });
  it('check if project name is displaying', () => {
    axios.get.mockResolvedValue({
      status: 200,
    });
    render(
      <Provider store={store}>
        <ProjectReport />
      </Provider>,
    );
    expect(screen.getByText('project 1')).toBeInTheDocument();
  });
  it('check if getProjectDetail works as expected', async () => {
    const mockProjectDetail = { projectId: 'abc456', projectName: 'project 2', isActive: false };
    axios.get.mockResolvedValue({
      data: mockProjectDetail,
    });
    const store = mockStore({});

    const expectedActions = [{ type: 'GET_PROJECT_BY_ID', payload: mockProjectDetail }];
    await store.dispatch(getProjectDetail('abc456'));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('check if getProjectDetail puts out an error message when get request fails', async () => {
    const errorResponse = { status: 401 };

    axios.get.mockRejectedValue(errorResponse);
    const store = mockStore({});

    await store.dispatch(getProjectDetail('abc456'));
    expect(store.getActions()).toEqual([]);
  });
  it('check if fetchAllMembers works as expected', async () => {
    const mockMembers = [
      { memberId: 'member123', Name: 'member name1' },
      { memberId: 'member456', Name: 'member name2' },
    ];
    axios.get.mockResolvedValue({
      data: mockMembers,
    });
    const store = mockStore({});

    const expectedActions = [
      { type: 'FETCH_MEMBERS_START' },
      { type: 'FOUND_USERS', users: [] },
      { type: 'RECIVES_MEMBERS', members: mockMembers },
    ];
    await store.dispatch(fetchAllMembers('abc456'));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('check if fetchAllMembers puts out an error message when get request fails', async () => {
    const errorResponse = { status: 500, message: 'server error' };

    axios.get.mockRejectedValue(errorResponse);
    const store = mockStore({});

    const expectedErrorAction = [
      { type: 'FETCH_MEMBERS_START' },
      { type: 'FOUND_USERS', users: [] },
      {
        type: 'FETCH_MEMBERS_ERROR',
        err: errorResponse,
      },
    ];

    await store.dispatch(fetchAllMembers('abc456'));
    await flushAllPromises();
    expect(store.getActions()).toEqual(expectedErrorAction);
  });
  it('check if getProjectActiveUser works as expected', async () => {
    const mockUser = [
      { _id: 'member123', name: 'user name 1', isActive: true },
      { _id: 'member456', name: 'user name 2', isActive: false },
      { _id: 'member789', name: 'user name 3', isActive: true },
    ];
    axios.get.mockResolvedValue({
      data: mockUser,
    });

    const store = mockStore({
      wbs: { WBSItems: [] },
      projectMembers: {
        members: [
          { _id: 'member123', firstName: 'member', lastName: 'name 1' },
          { _id: 'member456', firstName: 'member', lastName: 'name 2' },
          { _id: 'member789', firstName: 'member', lastName: 'name 3' },
        ],
        foundUsers: [],
        fetched: true,
      },
      tasks: [],
      projectReport: {
        project: {
          projectName: 'project 1',
          isLoading: false,
          isActive: false,
        },
      },
    });

    const userFilter = [
      {
        _id: 'member123',
        name: 'user name 1',
        isActive: true,
      },
      {
        _id: 'member789',
        name: 'user name 3',
        isActive: true,
      },
    ];

    const expectedActions = [
      { type: 'FIND_USERS_START' },
      { type: 'FOUND_USERS', users: userFilter },
    ];
    await store.dispatch(getProjectActiveUser());
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('check if getProjectActiveUser puts out an error message when get request fails', async () => {
    const errorResponse = { status: 500, message: 'server error' };

    axios.get.mockRejectedValue(errorResponse);
    const store = mockStore({});

    const expectedErrorAction = [
      { type: 'FIND_USERS_START' },
      { type: 'FIND_USERS_ERROR', err: errorResponse },
    ];

    await store.dispatch(getProjectActiveUser());
    await flushAllPromises();
    expect(store.getActions()).toEqual(expectedErrorAction);
  });
  it('check if fetchAllWBS works as expected', async () => {
    const mockWBS = [
      { wbsId: 'wbs123', Name: 'wbs name1' },
      { wbsId: 'wbs456', Name: 'wbs name2' },
    ];
    axios.get.mockResolvedValue({
      data: mockWBS,
    });
    const store = mockStore({});

    const expectedActions = [
      { type: 'FETCH_WBS_START' },
      { type: 'RECIVES_WBS', WBSItems: mockWBS },
    ];
    await store.dispatch(fetchAllWBS('abc456'));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('check if fetchAllWBS puts out an error message when get request fails', async () => {
    const errorResponse = { status: 500, message: 'server error' };

    axios.get.mockRejectedValue(errorResponse);
    const store = mockStore({});

    const expectedErrorAction = [
      { type: 'FETCH_WBS_START' },
      {
        type: 'FETCH_WBS_ERROR',
        err: errorResponse,
      },
    ];

    await store.dispatch(fetchAllWBS('abc456'));
    await flushAllPromises();
    expect(store.getActions()).toEqual(expectedErrorAction);
  });
});
