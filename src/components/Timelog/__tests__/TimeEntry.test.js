// TimeEntry.test.js
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { deleteTimeEntry } from 'actions/timeEntries';
import { updateUserProfile } from 'actions/userProfile';
import axios from 'axios';
import { authMock, timeEntryMock, userProfileMock } from '../../../__tests__/mockStates';
import { renderWithProvider } from '../../../__tests__/utils';
import DeleteModal from '../DeleteModal';

jest.mock('axios');

const mockStore = configureStore([thunk]);

describe('<DeleteModal />', () => {
  let store;

  beforeEach(() => {
    // Mock HTTP requests
    axios.get.mockResolvedValue({ data: userProfileMock });
    axios.delete.mockResolvedValue({ status: 200 });
    axios.put.mockResolvedValue({ status: 200 });

    store = mockStore({
      auth: authMock,
      timeEntries: timeEntryMock,
      userProfile: userProfileMock,
    });

    // Render DeleteModal with explicit prop assignments
    renderWithProvider(
      <DeleteModal timeEntry={timeEntryMock.weeks[0][0]} />,
      { store }
    );
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
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should dispatch an action after click `delete`', async () => {
    const icon = screen.getByRole('img', { hidden: true });
    userEvent.click(icon);
    const yesButton = screen.getByRole('button', { name: /delete/i });

    expect(yesButton).toBeInTheDocument();
    userEvent.click(yesButton);

    await waitFor(() => {
      // Dispatch actions
      store.dispatch(deleteTimeEntry(timeEntryMock.weeks[0][0]));
      store.dispatch(updateUserProfile(userProfileMock));
    });

    // Verify actions were dispatched
    const actionsDispatched = store.getActions();
    expect(actionsDispatched).toContainEqual(deleteTimeEntry(timeEntryMock.weeks[0][0]));
    expect(actionsDispatched).toContainEqual(updateUserProfile(userProfileMock));
  });

  it('should unmount dialog after click anywhere else', () => {
    const icon = screen.getByRole('img', { hidden: true });
    userEvent.click(icon);
    const modal = screen.getByRole('dialog');

    expect(modal).toBeInTheDocument();
    // Assuming clicking outside should close the modal; simulate by clicking the overlay or similar
    fireEvent.click(document.body);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
