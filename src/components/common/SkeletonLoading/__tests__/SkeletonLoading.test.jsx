import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';
import SkeletonLoading from '../SkeletonLoading';

const mockStore = configureStore([]);

describe('SkeletonLoading Component', () => {
  let consoleErrorMock;

  beforeEach(() => {
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
  });

  it('renders Timelog template', () => {
    const store = mockStore({ theme: themeMock });
    render(
      <Provider store={store}>
        <SkeletonLoading template="Timelog" />
      </Provider>,
    );
    expect(screen.getByTestId('timelog')).toBeInTheDocument();
  });

  it('renders TimelogFilter template', () => {
    const store = mockStore({ theme: themeMock });
    render(
      <Provider store={store}>
        <SkeletonLoading template="TimelogFilter" />
      </Provider>,
    );
    expect(screen.getByTestId('timelog-filter')).toBeInTheDocument();
  });

  it('renders TeamMemberTasks template', () => {
    const store = mockStore({ theme: themeMock });
    render(
      <Provider store={store}>
        <SkeletonLoading template="TeamMemberTasks" />
      </Provider>,
    );
    expect(screen.getAllByTestId('team-member-tasks-row')).toHaveLength(15);
  });

  it('renders WeeklySummary template', () => {
    const store = mockStore({ theme: themeMock });
    render(
      <Provider store={store}>
        <SkeletonLoading template="WeeklySummary" />
      </Provider>,
    );
    expect(screen.getByTestId('weekly-summary')).toBeInTheDocument();
  });

  it('renders WeeklySummariesReport template', () => {
    const store = mockStore({ theme: themeMock });
    render(
      <Provider store={store}>
        <SkeletonLoading template="WeeklySummariesReport" />
      </Provider>,
    );
    expect(screen.getAllByTestId('weekly-summaries-report-item').length).toBeGreaterThan(0);
  });

  it('renders UserProfile template', () => {
    const store = mockStore({ theme: themeMock });
    render(
      <Provider store={store}>
        <SkeletonLoading template="UserProfile" />
      </Provider>,
    );
    expect(screen.getAllByTestId('user-profile-item').length).toBeGreaterThan(0);
  });

  it('renders UserManagement template', () => {
    const store = mockStore({ theme: themeMock });
    render(
      <Provider store={store}>
        <SkeletonLoading template="UserManagement" />
      </Provider>,
    );
    expect(screen.getAllByTestId('user-management-item')).toHaveLength(17);
  });

  it('renders default case correctly', () => {
    const store = mockStore({ theme: themeMock });
    render(
      <Provider store={store}>
        <SkeletonLoading template="UnknownTemplate" />
      </Provider>,
    );
    expect(screen.queryByTestId('timelog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('weekly-summary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-management-item')).not.toBeInTheDocument();
  });
});
