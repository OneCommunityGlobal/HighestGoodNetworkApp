import React from 'react';
import { render, screen, fireEvent, waitFor, act, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UserRoleTab from '../UserRoleTab';
import thunk from 'redux-thunk';
import mockAdminState from '__tests__/mockAdminState';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import axios from 'axios';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { themeMock } from '__tests__/mockStates';

const mockStore = configureStore([thunk]);
let store;
beforeEach(() => {
  store = mockStore({
    auth: {
      user: {
        userid: 'abc123',
        permissions: {
          frontPermissions: [],
          backPermissions: [],
        },
        role: 'Test',
      },
    },
    role: mockAdminState.role,
    userProfile: { _id: 'abc123', firstName: 'test', lastName: 'one', role: 'Test' },
    rolePreset: { presets: mockAdminState.role.roles[3].permissions },
    theme: themeMock,
  });
});

afterEach(() => {
  store.clearActions();
});

jest.mock('axios');

describe('UserRoleTab component when the role does not exist', () => {
  it('renders without crashing', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {},
    });
    render(
      <Provider store={store}>
        <UserRoleTab match={{ params: { userRole: 'Test' } }} />
      </Provider>,
    );
  });
  it('check if Error header is displaying as expected when the role is not present', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {},
    });
    render(
      <Provider store={store}>
        <UserRoleTab match={{ params: { userRole: 'Test' } }} />
      </Provider>,
    );
    expect(screen.queryByText('Error')).toBeInTheDocument();
  });
  it('check if user role not existing header is displaying when the role is nor present', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {},
    });
    render(
      <Provider store={store}>
        <UserRoleTab match={{ params: { userRole: 'Test' } }} />
      </Provider>,
    );
    expect(screen.queryByText('User Role not existent')).toBeInTheDocument();
  });
  it('check Back to permissions management link', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {},
    });
    render(
      <Provider store={store}>
        <UserRoleTab match={{ params: { userRole: 'Test' } }} />
      </Provider>,
    );
    const linkElement = screen.getByText('Back to permissions management');
    const hrefElement = linkElement.getAttribute('href');
    expect(hrefElement).toBe('/permissionsmanagement');
  });
});
describe('UserRoleTab component when the role does exist', () => {
  it('check if back button routes to permission management page', () => {
    const testStore = mockStore({
      auth: {
        user: {
          userid: 'abc123',
          permissions: {
            frontPermissions: [],
            backPermissions: [],
          },
          role: 'Manager',
        },
      },
      role: mockAdminState.role,
      userProfile: { _id: 'abc123', firstName: 'test', lastName: 'manager', role: 'Manager' },
      rolePreset: { presets: mockAdminState.role.roles[3].permissions },
      theme: themeMock,
    });
    axios.get.mockResolvedValue({
      status: 200,
      data: {},
    });
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <Provider store={testStore}>
          <UserRoleTab match={{ params: { userRole: 'manager' } }} />
        </Provider>
      </Router>,
    );
    const backButtonElement = screen.getByText('Back');
    fireEvent.click(backButtonElement);
    expect(history.location.pathname).toBe('/permissionsmanagement');
  });
});
