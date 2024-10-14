import React from 'react';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import thunk from 'redux-thunk';
import { getUserProfile } from '../../../../actions/userProfile';
import UserProfileEditContainer from '../UserProfileEdit.container';

// Mock the actions
jest.mock('../../../../actions/userProfile', () => ({
  getUserProfile: jest.fn(() => (dispatch) => {
    // This mock should simulate a successful action dispatch
    dispatch({ type: 'GET_USER_PROFILE_SUCCESS', payload: { name: 'John Doe', email: 'john@example.com' } });
  }),
}));

const mockStore = configureMockStore([thunk]);

describe('UserProfileEdit Component', () => {
  let store;

  beforeEach(() => {
    // Initialize mock Redux store
    store = mockStore({
      auth: { isAuthenticated: true, user: { role: 'admin' } },
      userProfile: {}, // Initial state is empty
      user: { id: 1 },
      timeEntries: [],
      userProjects: [],
      allProjects: [],
      allTeams: {},
      role: 'admin',
      match: {
        params: {
          userId: 1
        }
      }
    });
  });

  it('should render UserProfileEditContainer component with initial state', () => {
    render(
      <Provider store={store}>
        <UserProfileEditContainer />
      </Provider>
    );

    // Check if the component renders properly
    expect(screen.getByText(/UserProfileEdit/i)).toBeInTheDocument();
  });

  it('should dispatch getUserProfile action on mount', () => {
    render(
      <Provider store={store}>
        <UserProfileEditContainer />
      </Provider>
    );

    // Check if the getUserProfile action was dispatched
    const actions = store.getActions();
    expect(getUserProfile).toHaveBeenCalled();
    expect(actions).toContainEqual(expect.objectContaining({ type: 'GET_USER_PROFILE_SUCCESS' }));
  });

  it('should display user profile data', () => {
    // You can set up your mock store here to contain userProfile data
    store = mockStore({
      auth: { isAuthenticated: true, user: { role: 'admin' } },
      userProfile: { name: 'John Doe', email: 'john@example.com' }, // Simulate loaded user profile
      user: { id: 1 },
      timeEntries: [],
      userProjects: [],
      allProjects: [],
      allTeams: {},
      role: 'admin',
      match: {
        params: {
          userId: 1
        }
      }
    });

    render(
      <Provider store={store}>
        <UserProfileEditContainer />
      </Provider>
    );

    // Check if user profile data is displayed
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
  });
});
