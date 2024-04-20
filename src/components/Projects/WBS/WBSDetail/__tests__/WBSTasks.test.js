import React from 'react';
import { render, screen, fireEvent, waitFor, act, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WBSTasks from '../WBSTasks';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import mockAdminState from '__tests__/mockAdminState';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createMemoryHistory } from 'history';
import axios from 'axios';

const mockStore = configureStore([thunk]);

let store;
beforeEach(() => {
  store = mockStore({
    auth: {
      user: {
        permissions: {
          frontPermissions: [],
          backPermissions: [],
        },
        role: 'Owner',
      },
      permissions: {
        frontPermissions: [],
        backPermissions: [],
      },
    },
    role: mockAdminState.role,
    tasks: { taskItems: [], fetched: true, copiedTask: '', error: 500 },
    projectMembers: { members: [] },
    popupEditor: { currPopup: { popupContent: '' } },
    allProjects: {
      projects: [
        {
          isActive: true,
          _id: 'project123',
          projectName: 'Project 1',
          category: 'Society',
        },
      ],
    },
  });
  jest.resetModules();
});

afterEach(() => {
  store.clearActions();
});

const setState = jest.fn();

const originalUseState = jest.requireActual('react').useState;

const useStateMock = initial => {
  if (
    initial === 'all' ||
    initial === 'assigned' ||
    initial === 'unassigned' ||
    initial === 'active' ||
    initial === 'inactive' ||
    initial === 'complete'
  ) {
    return [initial, setState];
  } else {
    return originalUseState(initial);
  }
};

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: useStateMock,
}));

jest.mock('axios');
const wbsId = 'wbs123';
const projectId = 'project123';
const wbsName = 'wbs name 1';

describe('WBSTasks component', () => {
  it('check if wbs name is displaying as expected', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const history = createMemoryHistory();

    await waitFor(() => {
      render(
        <Router history={history}>
          <Provider store={store}>
            <WBSTasks
              match={{ params: { wbsId: wbsId, projectId: projectId, wbsName: wbsName } }}
            />
          </Provider>
        </Router>,
      );
    });
    expect(screen.queryByText('wbs name 1')).toBeInTheDocument();
  });
  it('check link to the projectId', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const history = createMemoryHistory();

    await waitFor(() => {
      const { container } = render(
        <Router history={history}>
          <Provider store={store}>
            <WBSTasks
              match={{ params: { wbsId: wbsId, projectId: projectId, wbsName: wbsName } }}
            />
          </Provider>
        </Router>,
      );

      const linkElement = container.querySelector('.nav-item');
      const hrefElement = linkElement.getAttribute('href');
      expect(hrefElement).toBe(`/project/wbs/${projectId}`);
    });
  });
  it('check if clicking on the button routes to the projectId link', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const history = createMemoryHistory();

    await waitFor(() => {
      const { container } = render(
        <Router history={history}>
          <Provider store={store}>
            <WBSTasks
              match={{ params: { wbsId: wbsId, projectId: projectId, wbsName: wbsName } }}
            />
          </Provider>
        </Router>,
      );
      const buttonElement = container.querySelector('.btn.btn-secondary');
      fireEvent.click(buttonElement);
      expect(history.location.pathname).toBe(`/project/wbs/${projectId}`);
    });
  });
  it('check if addTaskModal is displayed when postTask permission is present', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const testStore = mockStore({
      auth: {
        user: {
          permissions: {
            frontPermissions: ['postTask'],
            backPermissions: [],
          },
          role: 'Manager',
        },
        permissions: {
          frontPermissions: [],
          backPermissions: [],
        },
      },
      role: mockAdminState.role,
      tasks: { taskItems: [], fetched: true, copiedTask: '', error: 500 },
      projectMembers: { members: [] },
      popupEditor: { currPopup: { popupContent: '' } },
      allProjects: {
        projects: [
          {
            isActive: true,
            _id: 'project123',
            projectName: 'Project 1',
            category: 'Society',
          },
        ],
      },
    });
    const history = createMemoryHistory();

    await waitFor(() => {
      render(
        <Router history={history}>
          <Provider store={testStore}>
            <WBSTasks
              match={{ params: { wbsId: wbsId, projectId: projectId, wbsName: wbsName } }}
            />
          </Provider>
        </Router>,
      );
    });
    expect(screen.queryByText('Add Task')).toBeInTheDocument();
  });
  it('check if addTaskModal is not displayed when postTask permission is not present', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const testStore = mockStore({
      auth: {
        user: {
          permissions: {
            frontPermissions: [],
            backPermissions: [],
          },
          role: 'Volunteer',
        },
        permissions: {
          frontPermissions: [],
          backPermissions: [],
        },
      },
      role: mockAdminState.role,
      tasks: { taskItems: [], fetched: true, copiedTask: '', error: 500 },
      projectMembers: { members: [] },
      popupEditor: { currPopup: { popupContent: '' } },
      allProjects: {
        projects: [
          {
            isActive: true,
            _id: 'project123',
            projectName: 'Project 1',
            category: 'Society',
          },
        ],
      },
    });
    const history = createMemoryHistory();
    await waitFor(() => {
      render(
        <Router history={history}>
          <Provider store={testStore}>
            <WBSTasks
              match={{ params: { wbsId: wbsId, projectId: projectId, wbsName: wbsName } }}
            />
          </Provider>
        </Router>,
      );
    });
    expect(screen.queryByText('Add Task')).not.toBeInTheDocument();
  });
  it('check if refresh button works as expected', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const history = createMemoryHistory();

    await waitFor(() => {
      render(
        <Router history={history}>
          <Provider store={store}>
            <WBSTasks
              match={{ params: { wbsId: wbsId, projectId: projectId, wbsName: wbsName } }}
            />
          </Provider>
        </Router>,
      );
    });
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    await waitFor(() => {});
    const isEmptyTaskItemsActionPresent = store
      .getActions()
      .some(action => action.type === 'EMPTY_TASK_ITEMS');
    expect(isEmptyTaskItemsActionPresent).toBe(true);
  });
  it('check if import task is visible if loading and showImport is true', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const history = createMemoryHistory();

    await waitFor(() => {
      render(
        <Router history={history}>
          <Provider store={store}>
            <WBSTasks
              match={{ params: { wbsId: wbsId, projectId: projectId, wbsName: wbsName } }}
            />
          </Provider>
        </Router>,
      );
    });
    expect(screen.queryByText('Import Tasks')).toBeInTheDocument();
  });
  it('check if Unfold All button works as expected', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const history = createMemoryHistory();

    await waitFor(() => {
      render(
        <Router history={history}>
          <Provider store={store}>
            <WBSTasks
              match={{ params: { wbsId: wbsId, projectId: projectId, wbsName: wbsName } }}
            />
          </Provider>
        </Router>,
      );
    });

    expect(screen.queryByText('Unfold All')).toBeInTheDocument();
    const unfoldAllButton = screen.getByText('Unfold All');
    fireEvent.click(unfoldAllButton);
    expect(screen.queryByText('fold All')).toBeInTheDocument();
  });
});

describe('test state updates', () => {
  it('check if All button works as expected', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const history = createMemoryHistory();

    await waitFor(() => {
      render(
        <Router history={history}>
          <Provider store={store}>
            <WBSTasks
              match={{ params: { wbsId: wbsId, projectId: projectId, wbsName: wbsName } }}
            />
          </Provider>
        </Router>,
      );
    });
    expect(setState).not.toHaveBeenCalled();
    const allButton = screen.getByText('All');
    fireEvent.click(allButton);
    expect(setState).toHaveBeenCalledWith('all');
  });
  it('check if assigned button works as expected', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const history = createMemoryHistory();

    await waitFor(() => {
      render(
        <Router history={history}>
          <Provider store={store}>
            <WBSTasks
              match={{ params: { wbsId: wbsId, projectId: projectId, wbsName: wbsName } }}
            />
          </Provider>
        </Router>,
      );
    });
    expect(setState).not.toHaveBeenCalled();
    const assignedButton = screen.getByText('Assigned');
    fireEvent.click(assignedButton);
    expect(setState).toHaveBeenCalledWith('assigned');
  });
  it('check if unassigned button works as expected', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const history = createMemoryHistory();

    await waitFor(() => {
      render(
        <Router history={history}>
          <Provider store={store}>
            <WBSTasks
              match={{ params: { wbsId: wbsId, projectId: projectId, wbsName: wbsName } }}
            />
          </Provider>
        </Router>,
      );
    });
    expect(setState).not.toHaveBeenCalled();
    const unassignedButton = screen.getByText('Unassigned');
    fireEvent.click(unassignedButton);
    expect(setState).toHaveBeenCalledWith('unassigned');
  });
  it('check if active button works as expected', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const history = createMemoryHistory();

    await waitFor(() => {
      render(
        <Router history={history}>
          <Provider store={store}>
            <WBSTasks
              match={{ params: { wbsId: wbsId, projectId: projectId, wbsName: wbsName } }}
            />
          </Provider>
        </Router>,
      );
    });
    expect(setState).not.toHaveBeenCalled();
    const activeButton = screen.getByText('Active');
    fireEvent.click(activeButton);
    expect(setState).toHaveBeenCalledWith('active');
  });
  it('check if inactive button works as expected', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const history = createMemoryHistory();

    await waitFor(() => {
      render(
        <Router history={history}>
          <Provider store={store}>
            <WBSTasks
              match={{ params: { wbsId: wbsId, projectId: projectId, wbsName: wbsName } }}
            />
          </Provider>
        </Router>,
      );
    });
    expect(setState).not.toHaveBeenCalled();
    const inactiveButton = screen.getByText('Inactive');
    fireEvent.click(inactiveButton);
    expect(setState).toHaveBeenCalledWith('inactive');
  });
  it('check if complete button works as expected', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const history = createMemoryHistory();

    await waitFor(() => {
      render(
        <Router history={history}>
          <Provider store={store}>
            <WBSTasks
              match={{ params: { wbsId: wbsId, projectId: projectId, wbsName: wbsName } }}
            />
          </Provider>
        </Router>,
      );
    });
    expect(setState).not.toHaveBeenCalled();
    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);
    expect(setState).toHaveBeenCalledWith('complete');
  });
});
