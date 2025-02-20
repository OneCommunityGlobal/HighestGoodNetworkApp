import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Warning from '../Warnings';
import * as warningActions from '../../../actions/warnings';

jest.mock('../../../actions/warnings', () => ({
  getWarningsByUserId: jest.fn(() => () => Promise.resolve([])),
  postWarningByUserId: jest.fn(() => () => Promise.resolve([])),
  deleteWarningsById: jest.fn(() => () => Promise.resolve([])),
}));

const mockStore = configureStore([thunk]);

describe('Warning Component', () => {
  let store;
  const initialState = {};
  const mockPersonId = '123';
  const mockUsername = 'testuser';

  beforeEach(() => {
    store = mockStore(initialState);
    jest.clearAllMocks();
  });

  test('renders nothing for non-admin users', () => {
    render(
      <Provider store={store}>
        <Warning personId={mockPersonId} username={mockUsername} userRole="User" />
      </Provider>
    );

    expect(screen.queryByText('Tracking')).not.toBeInTheDocument();
  });

  test('renders Tracking button for admin users', () => {
    render(
      <Provider store={store}>
        <Warning personId={mockPersonId} username={mockUsername} userRole="Administrator" />
      </Provider>
    );

    expect(screen.getByText('Tracking')).toBeInTheDocument();
  });

  test('toggles warnings display on button click', async () => {
    warningActions.getWarningsByUserId.mockImplementation(() => () => Promise.resolve([
      { title: 'Warning 1', warnings: [] },
    ]));

    render(
      <Provider store={store}>
        <Warning personId={mockPersonId} username={mockUsername} userRole="Administrator" />
      </Provider>
    );

    const toggleButton = screen.getByText('Tracking');
    await waitFor(() => fireEvent.click(toggleButton));

    expect(await screen.findByText('Hide')).toBeInTheDocument();
    expect(await screen.findByText('Warning 1')).toBeInTheDocument();
  });
});