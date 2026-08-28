// eslint-disable-next-line no-unused-vars
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import mockAdminState from '__tests__/mockAdminState';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import axios from 'axios';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { themeMock } from '__tests__/mockStates';
import { ModalProvider } from '~/context/ModalContext';
import UserRoleTab from '../UserRoleTab';

const mockStore = configureMockStore([thunk]);
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

vi.mock('axios');

describe('UserRoleTab component when the role does not exist', () => {
  it('renders without crashing', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {},
    });
    render(
      <Provider store={store}>
        <ModalProvider>
          <UserRoleTab match={{ params: { userRole: 'Test' } }} />
        </ModalProvider>
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
        <ModalProvider>
          <UserRoleTab match={{ params: { userRole: 'Test' } }} />
        </ModalProvider>
      </Provider>,
    );
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
  it('check if user role not existing header is displaying when the role is nor present', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {},
    });
    render(
      <Provider store={store}>
        <ModalProvider>
          <UserRoleTab match={{ params: { userRole: 'Test' } }} />
        </ModalProvider>
      </Provider>,
    );
    expect(screen.getByText('User Role not existent')).toBeInTheDocument();
  });
  it('check Back to permissions management link', () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {},
    });
    render(
      <Provider store={store}>
        <ModalProvider>
          <UserRoleTab match={{ params: { userRole: 'Test' } }} />
        </ModalProvider>
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
          <ModalProvider>
            <UserRoleTab match={{ params: { userRole: 'manager' } }} />
          </ModalProvider>
        </Provider>
      </Router>,
    );
    const backButtonElement = screen.getByText('Back');
    fireEvent.click(backButtonElement);
    expect(history.location.pathname).toBe('/permissionsmanagement');
  });
});
