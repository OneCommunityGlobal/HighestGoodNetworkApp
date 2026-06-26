// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Warning from '../Warnings';
import * as warningActions from '../../../actions/warnings';

vi.mock('../../../actions/warnings', () => ({
  getWarningsByUserId: vi.fn(() => () => Promise.resolve([{ title: 'Warning 1', warnings: [] }])),
  postWarningByUserId: vi.fn(() => () => Promise.resolve([])),
  deleteWarningsById: vi.fn(() => () => Promise.resolve([])),
}));
const mockStore = configureMockStore([thunk]);

describe('Warning Component', () => {
  let store;
  const initialState = {
    role: {
      roles: [
        {
          roleName: 'Administrator',
          permissions: [],
        },
        {
          roleName: 'User',
          permissions: [],
        },
      ],
    },
    auth: {
      user: {
        role: 'User',
        permissions: {
          frontPermissions: [],
          backPermissions: [],
        },
      },
    },
    theme: {
      darkMode: false,
    },
  };
  const mockPersonId = '123';
  const mockUsername = 'testuser';

  beforeEach(() => {
    store = mockStore(initialState);
  });

  test('renders nothing for non-admin users', () => {
    render(
      <Provider store={store}>
        <Warning personId={mockPersonId} username={mockUsername} userRole="User" />
      </Provider>,
    );

    expect(screen.queryByText('Tracking')).not.toBeInTheDocument();
  });

  test('renders Tracking button for admin users', () => {
    render(
      <Provider store={store}>
        <Warning personId={mockPersonId} username={mockUsername} userRole="Administrator" />
      </Provider>,
    );

    expect(screen.getByText('Tracking')).toBeInTheDocument();
  });

  test('toggles warnings display on button click', async () => {
    render(
      <Provider store={store}>
        <Warning personId={mockPersonId} username={mockUsername} userRole="Administrator" />
      </Provider>,
    );

    const toggleButton = screen.getByText('Tracking');
    fireEvent.click(toggleButton);

    expect(await screen.findByText('Hide')).toBeInTheDocument();
    expect(await screen.findByText('Warning 1')).toBeInTheDocument();
  });
});
