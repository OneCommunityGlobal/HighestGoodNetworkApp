import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Projects from '..';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { rolesMock } from '__tests__/mockStates';

import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';

const mockStore = configureMockStore([thunk]);

const auth = {
  user: {
    permissions: {
      frontPermissions: [],
      backPermissions: [],
    },
    role: 'Manager',
    userid: 'user123',
  },
};

const theme = { darkMode: false };
const infoCollections = { loading: false };

const projects = [
  {
    _id: 'project123',
    isActive: true,
    modifiedDatetime: '2024-06-20T15:57:30.463+00:00',
    projectName: 'Team Calls',
    createdDatetime: '2018-04-19T23:11:22.503+00:00',
    __v: 0,
    category: 'Society',
    isArchived: false,
  },
];

let store;

beforeEach(() => {
  store = mockStore({
    auth: auth,
    theme: theme,
    projectTarget: { projectId: 'project123', projectName: 'project name 1' },
    projectInfoModal: false,
    userProfile: { role: 'Manager' },
    popupEditor: { currPopup: { popupContent: 'project content 1' } },
    infoCollections: infoCollections,
    role: { roles: rolesMock.role.roles },
    projectMembers: { activeMemberCounts: {} },
    allProjects: {
      error: null,
      fetched: true,
      fetching: false,
      projects: [
        {
          category: 'Food',
          inventoryModifiedDatetime: '2025-08-13T16:51:36.975Z',
          isActive: true,
          membersModifiedDatetime: '2025-08-13T16:51:36.975Z',
          modifiedDatetime: '2025-08-13T16:57:40.613Z',
          projectName: 'Name test ',
          _id: '689cc4042da8947a0b085tfs',
        },
      ],
      status: 200,
    },
  });
});

vi.mock('axios');

const mockAxiosSuccess = () => {
  axios.get.mockResolvedValue({
    status: 200,
    data: [],
  });
};

const renderProjects = (customStore = store) =>
  render(
    <MemoryRouter>
      <Provider store={customStore}>
        <Projects />
      </Provider>
    </MemoryRouter>,
  );

const buildTestAuth = frontPermissions => ({
  user: {
    permissions: {
      frontPermissions,
      backPermissions: [],
    },
    role: 'Owner',
    userid: 'user123',
  },
});

const buildTestStore = ({
  authState = auth,
  userProfileRole = 'Manager',
  allProjectsState = { projects: [], status: 'Active', fetching: true, fetched: false },
} = {}) =>
  mockStore({
    auth: authState,
    theme: theme,
    projectTarget: { projectId: 'project123', projectName: 'project name 1' },
    projectInfoModal: false,
    allProjects: allProjectsState,
    userProfile: { role: userProfileRole },
    popupEditor: { currPopup: { popupContent: 'project content 1' } },
    infoCollections: infoCollections,
    role: { roles: rolesMock.role.roles },
  });

describe('Projects component', () => {
  it('renders without crashing', () => {
    mockAxiosSuccess();
    renderProjects();
  });
  it('check if Projects header displays as expected', () => {
    mockAxiosSuccess();
    renderProjects();
    expect(screen.getAllByText('Projects')[0]).toBeInTheDocument();
  });
  it('check if Project Name header displays as expected', async () => {
    mockAxiosSuccess();
    renderProjects();
    expect(screen.getAllByText('Project Name')[0]).toBeInTheDocument();
  });
  it('check if Category header displays as expected', () => {
    mockAxiosSuccess();
    renderProjects();
    expect(screen.getByText('Category')).toBeInTheDocument();
  });
  it('check if Active header displays as expected', () => {
    mockAxiosSuccess();
    renderProjects();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
  it('check if Members, WBS header displays as expected', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Projects
            projectList={[
              {
                category: 'Food',
                inventoryModifiedDatetime: '2025-08-13T16:51:36.975Z',
                isActive: true,
                membersModifiedDatetime: '2025-08-13T16:51:36.975Z',
                modifiedDatetime: '2025-08-13T16:57:40.613Z',
                projectName: 'Name test ',
                _id: '689cc4042da8947a0b085tfs',
              },
            ]}
          />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('WBS')).toBeInTheDocument();
  });
  it('check if loading elements get displayed when fetched is false', () => {
    mockAxiosSuccess();
    renderProjects();
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('WBS')).toBeInTheDocument();
  });
  it('check if loading spinner is displayed while projects are being fetched', () => {
    mockAxiosSuccess();
    const testStore = buildTestStore();
    renderProjects(testStore);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
  it('check if AddProject does not get displayed when postProject permission is not added', () => {
    mockAxiosSuccess();
    renderProjects();
    expect(screen.queryByText('Add New Project')).not.toBeInTheDocument();
  });
  it('check if AddProject gets displayed when postProject permission is added', () => {
    mockAxiosSuccess();
    const testAuth = buildTestAuth(['postProject', 'deleteProject', 'putProject']);
    const testStore = buildTestStore({ authState: testAuth, userProfileRole: 'Owner' });

    renderProjects(testStore);
    // expect(screen.queryByText('Add new project')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add new project/i })).toBeInTheDocument();
  });
  it('check if modal title is not set to error when the fetch status is 200', () => {
    mockAxiosSuccess();
    renderProjects();
    expect(screen.queryByText('ERROR')).not.toBeInTheDocument();
  });
  it('check if modal title is not set to error when modal is open', () => {
    mockAxiosSuccess();
    const testAuth = buildTestAuth(['postProject', 'deleteProject', 'putProject', 'deleteProject']);
    const testStore = buildTestStore({
      authState: testAuth,
      userProfileRole: 'Owner',
      allProjectsState: { projects: projects, status: 'Active', fetching: true, fetched: false },
    });

    const { container } = renderProjects(testStore);
    expect(screen.getByText('ERROR')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const ascendingButton = container.querySelector('[id="Ascending"]');
    if (ascendingButton) {
      fireEvent.click(ascendingButton);
    }

    // Code related to "Archive" functionality is refactored into Project component and will be tested in Project.test.js
    //   const archiveButton=screen.getAllByText('Archive')[1]
    //   fireEvent.click(archiveButton)

    //   expect(screen.getByText('Confirm Archive')).toBeInTheDocument();
    //   expect(screen.getByText(`Do you want to archive ${projects[0].projectName}?`)).toBeInTheDocument();

    //   const closeButton=screen.getByText('Close')
    //   fireEvent.click(closeButton)
    //   expect(screen.queryByText('Confirm Archive')).not.toBeInTheDocument();
  });
});
