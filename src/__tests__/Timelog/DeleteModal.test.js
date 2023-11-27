import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { authMock, timeEntryMock, userProfileMock} from '../mockStates';
import { renderWithProvider } from '../utils';
import DeleteModal from '../../components/Timelog/DeleteModal';
import * as actions from '../../actions/timeEntries';

const mockStore = configureStore([thunk]);
describe('<DeleteModal />', () => {
  let store;
  let userProfile;
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      timeEntries: timeEntryMock,
      userProfile: userProfileMock,
    });

    userProfile = jest.fn();
    store.dispatch = jest.fn();
    renderWithProvider(
      <DeleteModal timeEntry={timeEntryMock.weeks[0][0]}/>,
      { store },
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
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('should dispatch an action after click `delete`', async () => {
    const icon = screen.getByRole('img', { hidden: true });
    actions.deleteTimeEntry = jest.fn();
    userEvent.click(icon);
    const yesButton = screen.getByRole('button', { name: /delete/i });
    expect(yesButton).toBeInTheDocument();
    userEvent.click(yesButton);
    expect(store.dispatch).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledTimes(2);
    expect(actions.deleteTimeEntry).toBeCalled();
    expect(actions.deleteTimeEntry).toBeCalledTimes(1);
    expect(actions.deleteTimeEntry).toBeCalledWith(timeEntryMock.weeks[0][0]);
  });
  it('should umount dialog after click anywhere else', () => {
    const icon = screen.getByRole('img', { hidden: true });
    userEvent.click(icon);
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
  });
});
