import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import TeamMemberTasks from '../TeamMemberTasks';
import { rolesMock } from '__tests__/mockStates';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

const mockStore = configureStore([thunk]);

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

const teamMemberTasks = {
  isLoading: false,
  usersWithTasks: [
    {
      name: 'bb',
      personId: 'user123',
      tasks: [
        {
          deadlineCount: 1,
          dueDatetime: '2023-12-08T08:00:00.000Z',
          estimatedHours: 20,
          hoursBest: 20,
          hoursLogged: 17.55,
          hoursMost: 20,
          hoursWorst: 20,
          isAssigned: true,
          num: '1',
          projectId: 'project1234',
          resources: [],
          status: 'Started',
          taskName: 'Task 1',
          taskNotifications: [],
          wbsId: 'wbs1234',
          __v: 0,
          _id: 'task11234',
        },
      ],
      teams: [{ teamName: 'mockTeamName', _id: 'team123' }],
    },
    {
      name: 'aa',
      personId: 'user456',
      tasks: [],
      teams: [{ teamName: 'mockTeamName', _id: 'team123' }],
    },
  ],
  usersWithTimeEntries: [
    {
      personId: 'user123',
      _id: 'entry123',
      userProfile: [],
      dateOfWork: '2024-07-20T08:00:00.000Z',
    },
  ],
};

const userProfile = {
  _id: 'user123',
  role: 'Manager',
  startDate: '2023-12-08T08:00:00.000Z',
  teams: [{ teamName: 'mockTeamName', _id: 'team123' }],
};

const timeOffRequests = { onTimeOff: false, goingOnTimeOff: false };
const theme = { darkMode: false };

const store = mockStore({
  auth: auth,
  teamMemberTasks: teamMemberTasks,
  userProfile: userProfile,
  theme: theme,
  timeOffRequests: timeOffRequests,
  infoCollections: { loading: false },
  role: rolesMock,
});

jest.mock('axios');
jest.useFakeTimers();
describe('TeamMemberTasks component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
  });

  it('check if Team Member Tasks header is displaying as expected', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText('Team Member Tasks')).toBeInTheDocument();
  });

  it('check if Team Member header is displaying as expected', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText('Team Member')).toBeInTheDocument();
  });

  it('check if Weekly Committed Hours header is displaying as expected', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByTitle('Weekly Committed Hours')).toBeInTheDocument();
  });

  it('check if Total Hours Completed this Week header is displaying as expected', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByTitle('Total Hours Completed this Week')).toBeInTheDocument();
  });

  it('check if Total Remaining Hours header is displaying as expected', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByTitle('Total Remaining Hours')).toBeInTheDocument();
  });

  it('check if Tasks(s) header is displaying as expected', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText('Tasks(s)')).toBeInTheDocument();
  });

  it('check if Progress header is displaying as expected', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('check if the skeleton loading html elements are not shown when isLoading is false', () => {
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    const skeletonLoadingElement = container.querySelector(
      '.skeleton-loading-team-member-tasks-row',
    );
    expect(skeletonLoadingElement).not.toBeInTheDocument();
  });

  it('check if class names do not include color when dark mode is false', () => {
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    const taskTableElement = container.querySelector('.task-table');
    const timeOffElement = container.querySelector('.show-time-off-btn');
    const hoursCompletedElement = container.querySelector('.team-member-tasks-subtable');
    const oneDayElement = container.querySelector(
      '[title="Timelogs submitted in the past 1 days"]',
    );

    expect(taskTableElement).toBeInTheDocument();
    expect(taskTableElement).not.toHaveClass('bg-space-cadet');
    expect(hoursCompletedElement).toBeInTheDocument();
    expect(timeOffElement).toBeInTheDocument();
    expect(oneDayElement).toBeInTheDocument();
  });

  it('check if class names include color when dark mode is true', () => {
    const darkModeStore = mockStore({
      ...store.getState(),
      theme: { darkMode: true },
    });

    const { container } = render(
      <Provider store={darkModeStore}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    const taskTableBody = container.querySelector('.task-table tbody');
    const timeOffElement = container.querySelector('.show-time-off-btn');
    const hoursCompletedElement = container.querySelector('.team-member-tasks-subtable');
    const oneDayElement = container.querySelector(
      '[title="Timelogs submitted in the past 1 days"]',
    );

    expect(taskTableBody).toBeInTheDocument();
    expect(taskTableBody).toHaveClass('bg-yinmn-blue');
    expect(hoursCompletedElement).toBeInTheDocument();
    expect(timeOffElement).toBeInTheDocument();
    expect(oneDayElement).toBeInTheDocument();
  });

  it('check if show time off button works as expected', () => {
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    const buttonElement = container.querySelector('.show-time-off-btn');
    expect(container.querySelector('.show-time-off-calender-svg-selected')).toBeInTheDocument();
    expect(container.querySelector('.show-time-off-icon-selected')).toBeInTheDocument();
    fireEvent.click(buttonElement);
    expect(
      container.querySelector(
        '.show-time-off-calender-svg:not(.show-time-off-calender-svg-selected)',
      ),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.show-time-off-icon:not(.show-time-off-icon-selected)'),
    ).toBeInTheDocument();
  });

  it('check if days button works as expected', () => {
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    const buttonElement = container.querySelector(
      '[title="Timelogs submitted in the past 1 days"]',
    );
    expect(buttonElement).toHaveStyle(
      'color: rgb(34, 139, 34); background-color: white; border: 1px solid #228b22;',
    );
    fireEvent.click(buttonElement);
    expect(buttonElement).toHaveStyle(
      'color: white; background-color: rgb(34, 139, 34); border: 1px solid #228b22;',
    );
  });
});
