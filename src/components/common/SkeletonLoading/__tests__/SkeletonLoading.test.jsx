import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
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

  it.each([
    ['Timelog', 'timelog'],
    ['TimelogFilter', 'timelog-filter'],
    ['WeeklySummary', 'weekly-summary'],
  ])('renders %s template', (template, testId) => {
    const store = mockStore({ theme: themeMock });
    render(
      <Provider store={store}>
        <SkeletonLoading template={template} />
      </Provider>,
    );
    expect(screen.getByTestId(testId)).toBeInTheDocument();
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
