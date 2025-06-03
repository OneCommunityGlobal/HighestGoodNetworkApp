import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SkeletonLoading from '../SkeletonLoading';
import { themeMock } from '__tests__/mockStates';

// Create a mock store
const mockStore = configureStore([]);

describe('SkeletonLoading Component', () => {
  let consoleErrorMock;

  beforeEach(() => {
    // Mock console.error before each test
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    consoleErrorMock.mockRestore();
  });

  // Assuming you have specific class names for each template type
  it('renders Timelog template', () => {
    const initialState = {
      theme: themeMock,
    };
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <SkeletonLoading template="Timelog" />
      </Provider>,
    );
    expect(document.querySelector('.skeleton-loading-timelog')).toBeInTheDocument();
  });

  it('renders TimelogFilter template', () => {
    const initialState = {
      theme: themeMock,
    };
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <SkeletonLoading template="TimelogFilter" />
      </Provider>,
    );
    expect(document.querySelector('.skeleton-loading-timelog-filter')).toBeInTheDocument();
  });

  it('renders TeamMemberTasks template', () => {
    const initialState = {
      theme: themeMock,
    };
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <SkeletonLoading template="TeamMemberTasks" />
      </Provider>,
    );
    const rows = document.querySelectorAll('.skeleton-loading-team-member-tasks-row');
    expect(rows).toHaveLength(15);
  });

  it('renders WeeklySummary template', () => {
    const initialState = {
      theme: themeMock,
    };
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <SkeletonLoading template="WeeklySummary" />
      </Provider>,
    );
    expect(document.querySelector('.skeleton-loading-weekly-summary')).toBeInTheDocument();
  });

  it('renders WeeklySummariesReport template', () => {
    const initialState = {
      theme: themeMock,
    };
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <SkeletonLoading template="WeeklySummariesReport" />
      </Provider>,
    );
    const items = document.querySelectorAll('.skeleton-loading-weekly-summaries-report-item');
    expect(items.length).toBeGreaterThan(0);
  });

  it('renders UserProfile template', () => {
    const initialState = {
      theme: themeMock,
    };
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <SkeletonLoading template="UserProfile" />
      </Provider>,
    );
    const userProfileItems = document.querySelectorAll('.skeleton-loading-user-profile-item');
    expect(userProfileItems.length).toBeGreaterThan(0); // Or check for a specific number if applicable
  });

  it('renders UserManagement template', () => {
    const initialState = {
      theme: themeMock,
    };
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <SkeletonLoading template="UserManagement" />
      </Provider>,
    );
    const items = document.querySelectorAll('.skeleton-loading-user-management-item');
    expect(items).toHaveLength(17);
  });

  it('renders default case correctly', () => {
    const initialState = {
      theme: themeMock,
    };
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <SkeletonLoading template="UnknownTemplate" />
      </Provider>,
    );
    // Here you might want to check for the absence of all known class names
    expect(document.querySelector('.skeleton-loading-default')).toBeNull();
  });
});
