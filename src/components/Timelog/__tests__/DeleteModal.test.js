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
jest.mock('axios');

const mockStore = configureStore([thunk]);
describe('<DeleteModal />', () => {
  let store;
  beforeEach(() => {
    // need to mock the http requests
    axios.get.mockResolvedValue({ data: userProfileMock });
    axios.delete.mockResolvedValue({ status: 200 });
    axios.put.mockResolvedValue({ status: 200 });

    store = mockStore({
      auth: authMock,
      timeEntries: timeEntryMock,
      userProfile: userProfileMock,
    });
    renderWithProvider(<DeleteModal timeEntry={timeEntryMock.weeks[0][0]} />, { store });
  });
  it('should generate Modal after click', () => {
    const icon = screen.getByRole('img', { hidden: true });
    fireEvent.click(icon);
    const modalBody = screen.getByRole('dialog');
    const yesButton = screen.getByRole('button', { name: /delete/i });
    const noButton = screen.getByRole('button', { name: /cancel/i });
    expect(modalBody).toBeInTheDocument();
    expect(yesButton).toBeInTheDocument();
    expect(noButton).toBeInTheDocument();
  });
  it('should unmount modal after click cancel', () => {
    const icon = screen.getByRole('img', { hidden: true });
    userEvent.click(icon);
    const noButton = screen.getByRole('button', { name: /cancel/i });
    expect(noButton).toBeInTheDocument();
    userEvent.click(noButton);
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('should dispatch an action after click `delete`', async () => {
    const icon = screen.getByRole('img', { hidden: true });

    userEvent.click(icon);
    const yesButton = screen.getByRole('button', { name: /delete/i });

    expect(yesButton).toBeInTheDocument();
    userEvent.click(yesButton);
    await waitFor(() => {
      store.dispatch(deleteTimeEntry(timeEntryMock.weeks[0][0]));
      store.dispatch(updateUserProfile(userProfileMock));
    });
  });
  it('should umount dialog after click anywhere else', () => {
    const icon = screen.getByRole('img', { hidden: true });
    userEvent.click(icon);
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
  });
});
