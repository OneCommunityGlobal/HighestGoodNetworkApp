// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import thunk from 'redux-thunk';
import Warning from '../Warnings';
import * as warningActions from '../../../actions/warnings';

vi.mock('../../../actions/warnings', () => ({
  getWarningsByUserId: vi.fn(() => () => Promise.resolve([])),
  postWarningByUserId: vi.fn(() => () => Promise.resolve([])),
  deleteWarningsById: vi.fn(() => () => Promise.resolve([])),
}));

const mockStore = configureStore([thunk]);

describe('Warning Component', () => {
  let store;
  const initialState = {
    role: {
      roles: ['User'],
    },
    auth: {
      user: {
        role: 'User',
      },
    },
  };
  const mockPersonId = '123';
  const mockUsername = 'testuser';

  beforeEach(() => {
    store = mockStore(initialState);
    vi.clearAllMocks();
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
    warningActions.getWarningsByUserId.mockImplementation(() => () =>
      Promise.resolve([{ title: 'Warning 1', warnings: [] }]),
    );

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
