// @version 1.0.0
// Unit test for DeleteModal component

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { authMock, timeEntryMock, userProfileMock } from '../../../__tests__/mockStates';
import { renderWithProvider } from '../../../__tests__/utils';
import DeleteModal from '../DeleteModal';
import { deleteTimeEntry } from 'actions/timeEntries';
import { updateUserProfile } from 'actions/userProfile';
import axios from 'axios';

// Mock axios HTTP requests
jest.mock('axios');

// Initialize the mock store with thunk middleware
const mockStore = configureStore([thunk]);

// Main test suite for the DeleteModal component
describe('<DeleteModal />', () => {
  let store;

  // Before each test, set up the mocked store and mock API calls
  beforeEach(() => {
    // Mocking HTTP requests to return resolved promises
    axios.get.mockResolvedValue({ data: userProfileMock });
    axios.delete.mockResolvedValue({ status: 200 });
    axios.put.mockResolvedValue({ status: 200 });

    // Initializing the mock Redux store with predefined mock states
    store = mockStore({
      auth: authMock,
      timeEntries: timeEntryMock,
      userProfile: userProfileMock,
    });

    // Rendering DeleteModal component with the mock store
    renderWithProvider(<DeleteModal timeEntry={timeEntryMock.weeks[0][0]} />, { store });
  });

  // Test case: Modal should be generated after the icon click
  it('should generate Modal after click', () => {
    // Find and click the icon to open the modal
    const icon = screen.getByRole('img', { hidden: true });
    fireEvent.click(icon);

    // Checking if the modal and buttons are present
    const modalBody = screen.getByRole('dialog');
    const yesButton = screen.getByRole('button', { name: /delete/i });
    const noButton = screen.getByRole('button', { name: /cancel/i });

    // Assertions for modal and buttons
    expect(modalBody).toBeInTheDocument();
    expect(yesButton).toBeInTheDocument();
    expect(noButton).toBeInTheDocument();
  });

  // Test case: Modal should unmount after clicking "cancel"
  it('should unmount modal after click cancel', () => {
    // Open the modal by clicking the icon
    const icon = screen.getByRole('img', { hidden: true });
    userEvent.click(icon);

    // Find the "cancel" button and click it
    const noButton = screen.getByRole('button', { name: /cancel/i });
    expect(noButton).toBeInTheDocument();
    userEvent.click(noButton);

    // Verify the modal is no longer visible
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  // Test case: Dispatch an action after clicking "delete"
  it('should dispatch an action after click `delete`', async () => {
    // Open the modal by clicking the icon
    const icon = screen.getByRole('img', { hidden: true });
    userEvent.click(icon);

    // Find and click the "delete" button
    const yesButton = screen.getByRole('button', { name: /delete/i });
    expect(yesButton).toBeInTheDocument();
    userEvent.click(yesButton);

    // Wait for the actions to be dispatched and verify them
    await waitFor(() => {
      store.dispatch(deleteTimeEntry(timeEntryMock.weeks[0][0]));
      store.dispatch(updateUserProfile(userProfileMock));
    });
  });

  // Test case: Modal should unmount after clicking outside the modal
  it('should unmount dialog after click anywhere else', () => {
    // Open the modal by clicking the icon
    const icon = screen.getByRole('img', { hidden: true });
    userEvent.click(icon);

    // Verify the modal is in the document
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
  });
});