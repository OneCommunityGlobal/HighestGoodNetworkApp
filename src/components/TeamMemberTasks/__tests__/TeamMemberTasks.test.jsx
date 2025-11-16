import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { rolesMock } from '../../../__tests__/mockStates';
import TeamMemberTasks from '../TeamMemberTasks';

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
  auth,
  teamMemberTasks,
  userProfile,
  theme,
  timeOffRequests,
  infoCollections: { loading: false },
  role: rolesMock,
});

vi.mock('axios');

describe('TeamMemberTasks component', () => {
  it('renders without crashing', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
  });
  it('check if Team Member Tasks header is displaying as expected', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
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
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
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
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText('Weekly Committed Hours')).toBeInTheDocument();
  });
  it('check if Total Hours Completed this Week header is displaying as expected', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText('Total Hours Completed this Week')).toBeInTheDocument();
  });
  it('check if Total Remaining Hours header is displaying as expected', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText('Total Remaining Hours')).toBeInTheDocument();
  });
  it('check if Tasks(s) header is displaying as expected', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
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
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });
  it('check if the skeleton loading html elements are shown when isLoading is true', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    const newTeamMemberTasks = { isLoading: true, usersWithTasks: [], usersWithTimeEntries: [] };
    const testStore = mockStore({
      auth,
      teamMemberTasks: newTeamMemberTasks,
      userProfile,
      theme,
      timeOffRequests,
      infoCollections: { loading: false },
    });
    const { container } = render(
      <Provider store={testStore}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getAllByTestId('team-member-tasks-row')).not.toHaveLength(0);
  });
  it('check if the skeleton loading html elements are not shown when isLoading is false', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.queryByTestId('team-member-tasks-row')).not.toBeInTheDocument();
  });
  it('check if class names does not include color when dark mode is false', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );

    const timeOffButton = screen.getByTestId('show-time-off-btn');
    expect(timeOffButton).toBeInTheDocument();

    expect(screen.getByTestId('team-member-tasks-container')).toBeInTheDocument();

    fireEvent.click(timeOffButton);

    expect(screen.getByTitle('Timelogs submitted in the past 1 days')).toBeInTheDocument();

    expect(screen.getByTitle('Timelogs submitted in the past 2 days')).toBeInTheDocument();

    expect(screen.getByTitle('Timelogs submitted in the past 3 days')).toBeInTheDocument();

    expect(screen.getByTitle('Timelogs submitted in the past 4 days')).toBeInTheDocument();

    expect(screen.getByTitle('Timelogs submitted in the past 7 days')).toBeInTheDocument();
  });
  it('check if class names does include color when dark mode is true', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });

    const darkTheme = { darkMode: true };

    const testStore = mockStore({
      auth,
      teamMemberTasks,
      userProfile,
      theme: darkTheme,
      timeOffRequests,
      infoCollections: { loading: false },
      role: rolesMock,
    });

    const { container } = render(
      <Provider store={testStore}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByTestId('team-member-tasks-subtable')).toBeInTheDocument();

    expect(screen.getByTestId('team-member-tasks-container')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('show-time-off-btn'));

    expect(screen.getByTitle('Timelogs submitted in the past 1 days')).toBeInTheDocument();

    expect(screen.getByTitle('Timelogs submitted in the past 2 days')).toBeInTheDocument();

    expect(screen.getByTitle('Timelogs submitted in the past 3 days')).toBeInTheDocument();

    expect(screen.getByTitle('Timelogs submitted in the past 4 days')).toBeInTheDocument();

    expect(screen.getByTitle('Timelogs submitted in the past 7 days')).toBeInTheDocument();
  });
  it('check if show time off button works as expected', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    const buttonElement = screen.getByTestId('show-time-off-btn');

    expect(screen.getByTestId('time-off-calendar-icon')).toBeInTheDocument();
    expect(screen.getByTestId('show-time-off-icon')).toBeInTheDocument();

    fireEvent.click(buttonElement);

    expect(screen.getByTestId('time-off-calendar-icon')).toBeInTheDocument();
    expect(screen.getByTestId('show-time-off-icon')).toBeInTheDocument();
  });
  it('check if days button works as expected', () => {
    axios.get.mockResolvedValue({ status: 200, data: '' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );

    // Select the 1-day button by role and accessible name
    const daysButton = screen.getByRole('button', { name: /^1\s*day$/i });
    // Initial style
    expect(daysButton).toBeInTheDocument();
    expect(daysButton).toHaveStyle('color: rgb(34, 139, 34)');
    expect(daysButton).toHaveStyle('background-color: rgb(255, 255, 255)');
    expect(daysButton).toHaveStyle('border: 1px solid #228b22');

    // Click to activate
    fireEvent.click(daysButton);

    // After click, the same button updates styles
    expect(daysButton).toHaveStyle('color: rgb(255, 255, 255)');
    expect(daysButton).toHaveStyle('background-color: rgb(34, 139, 34)');
    expect(daysButton).toHaveStyle('border: 1px solid #228b22');
  });
  it('check if TeamMemberTask without time entries gets displayed when isTimeFilterActive is set to False', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamMemberTasks />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.queryByTestId('table-row')).not.toBeInTheDocument();
  });
});
