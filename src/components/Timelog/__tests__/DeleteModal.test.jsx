import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import axios from 'axios';
import { vi } from 'vitest';
import { authMock, timeEntryMock, userProfileMock } from '../../../__tests__/mockStates';
import { renderWithProvider } from '../../../__tests__/utils';
import DeleteModal from '../DeleteModal';
import * as timeEntryActions from '~/actions/timeEntries';

vi.mock('axios');

const mockStore = configureStore([thunk]);

describe('<DeleteModal />', () => {
  let store;

  const renderComponent = () => {
    axios.get.mockResolvedValue({ data: userProfileMock });
    axios.delete.mockResolvedValue({ status: 200 });
    axios.put.mockResolvedValue({ status: 200 });

    store = mockStore({
      auth: authMock,
      timeEntries: timeEntryMock,
      userProfile: userProfileMock,
    });

    renderWithProvider(<DeleteModal timeEntry={timeEntryMock.weeks[0][0]} />, { store });
  };

  it('should generate Modal after click', async () => {
    renderComponent();
    const icon = screen.getByRole('img', { hidden: true });
    await userEvent.click(icon);

    const modalBody = await screen.findByRole('dialog');
    const yesButton = screen.getByRole('button', { name: /delete/i });
    const noButton = screen.getByRole('button', { name: /cancel/i });

    expect(modalBody).toBeInTheDocument();
    expect(yesButton).toBeInTheDocument();
    expect(noButton).toBeInTheDocument();
  });

  it('should unmount modal after click cancel', async () => {
    renderComponent();
    const icon = screen.getByRole('img', { hidden: true });
    await userEvent.click(icon);

    const noButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(noButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should dispatch a DELETE action after click `delete`', async () => {
    // Arrange: Mock deleteTimeEntry to return a fake action
    const mockDeleteAction = { type: 'DELETE_TIME_ENTRY_SUCCESS' };
    const spy = vi
      .spyOn(timeEntryActions, 'deleteTimeEntry')
      .mockImplementation(() => async dispatch => {
        dispatch(mockDeleteAction);
      });

    renderComponent();
    const icon = screen.getByRole('img', { hidden: true });
    await userEvent.click(icon);

    const yesButton = await screen.findByRole('button', { name: /delete/i });
    await userEvent.click(yesButton);

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(mockDeleteAction);
    });

    spy.mockRestore();
  });

  it('should unmount dialog after click anywhere else', async () => {
    renderComponent();
    const icon = screen.getByRole('img', { hidden: true });
    await userEvent.click(icon);

    const modal = await screen.findByRole('dialog');
    expect(modal).toBeInTheDocument();
  });
});
