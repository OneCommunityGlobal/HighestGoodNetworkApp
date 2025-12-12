// import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import { configureStore } from 'redux-mock-store';
import { renderWithProvider } from '../../../__tests__/utils';
import DeleteUserPopup from '../DeleteUserPopup';
import { UserDeleteType } from '../../../utils/enums';
import { authMock, userProfileMock, rolesMock, themeMock } from '../../../__tests__/mockStates';

import {
  USER_DELETE_CONFIRMATION_FIRST_LINE,
  USER_DELETE_CONFIRMATION_SECOND_LINE,
  USER_DELETE_DATA_FOREVER,
  USER_DELETE_DATA_INACTIVE,
  USER_DELETE_DATA_ARCHIVE,
  USER_DELETE_OPTION_HEADING,
} from '../../../languages/en/messages';

const mockStore = configureStore([thunk]);
const onClose = vi.fn();
const onDelete = vi.fn();
let store;

const defaultProps = {
  open: true,
  onClose,
  onDelete,
};

// Reset spies and store before each test
beforeEach(() => {
  onClose.mockClear();
  onDelete.mockClear();
  store = mockStore({
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
    theme: themeMock,
    ...defaultProps,
  });
});

describe('delete user popup', () => {
  // beforeEach(() => {

  // });

  describe('Structure', () => {
    it('should render the modal', () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('should rendertwo close buttons', () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      expect(screen.getAllByRole('button', { name: /close/i })).toHaveLength(2);
    });
    it('should render one delete button', () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      expect(screen.getByRole('button', { name: /.*delete.*/i })).toBeInTheDocument();
    });
    it('should render one inactive button', () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      expect(screen.getByRole('button', { name: /.*inactive.*/i })).toBeInTheDocument();
    });
    it('should render one archive button', () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      expect(screen.getByRole('button', { name: /.*archiving.*/i })).toBeInTheDocument();
    });
  });

  describe('behavior', () => {
    it('should fire onClose() once the user clicks close buttons', async () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      await screen.getAllByRole('button', { name: /close/i }).forEach(async button => {
        await userEvent.click(button);
      });
      expect(onClose).toHaveBeenCalledTimes(2);
    });
    it('should fire onDelete(HardDelete) once the user clicks the `delete` button', async () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      await userEvent.click(screen.getByRole('button', { name: /.*delete.*/i }));
      expect(onDelete).toHaveBeenCalledWith(UserDeleteType.HardDelete);
    });
    it('should fire onDelete(SoftDelete) once the user clicks the `archive` button', async () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      await userEvent.click(screen.getByRole('button', { name: /.*archiving.*/i }));
      expect(onDelete).toHaveBeenCalledWith(UserDeleteType.SoftDelete);
    });
    it('should fire onDelete(Inactive) once the user clicks the `inactive` button', async () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      await userEvent.click(screen.getByRole('button', { name: /.*inactive.*/i }));
      expect(onDelete).toHaveBeenCalledWith(UserDeleteType.Inactive);
    });
  });
});

describe('delete user popup additional tests', () => {
  // beforeEach(() => {

  // });

  describe('Texts display', () => {
    it('should render USER_DELETE_CONFIRMATION_FIRST_LINE', () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      expect(
        screen.getByText(new RegExp(USER_DELETE_CONFIRMATION_FIRST_LINE, 'i')),
      ).toBeInTheDocument();
    });
    it('should render USER_DELETE_CONFIRMATION_SECOND_LINE', () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      expect(
        screen.getByText(new RegExp(USER_DELETE_CONFIRMATION_SECOND_LINE, 'i')),
      ).toBeInTheDocument();
    });
    it('should render USER_DELETE_DATA_FOREVER', () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      expect(screen.getByText(new RegExp(USER_DELETE_DATA_FOREVER, 'i'))).toBeInTheDocument();
    });
    it('should render USER_DELETE_DATA_INACTIVE', () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      expect(screen.getByText(new RegExp(USER_DELETE_DATA_INACTIVE, 'i'))).toBeInTheDocument();
    });
    it('should render USER_DELETE_DATA_ARCHIVE', () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      expect(screen.getByText(new RegExp(USER_DELETE_DATA_ARCHIVE, 'i'))).toBeInTheDocument();
    });
    it('should render USER_DELETE_OPTION_HEADING', () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      expect(screen.getByText(new RegExp(USER_DELETE_OPTION_HEADING, 'i'))).toBeInTheDocument();
    });
  });

  describe('more behaviors', () => {
    it('should not fire when close button is not clicked', () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      expect(onClose).toHaveBeenCalledTimes(0);
    });
    it('should fire onDelete(HardDelete) one time when the user clicks the `delete` button', async () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      await userEvent.click(screen.getByRole('button', { name: /.*delete.*/i }));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
    it('should fire onDelete(SoftDelete) one time when the user clicks the `archive` button', async () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      await userEvent.click(screen.getByRole('button', { name: /.*archiving.*/i }));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
    it('should fire onDelete(Inactive) one time when the user clicks the `inactive` button', async () => {
      renderWithProvider(<DeleteUserPopup
        open={defaultProps.open}
        onClose={defaultProps.onClose}
        onDelete={defaultProps.onDelete}
      />, { store });
      await userEvent.click(screen.getByRole('button', { name: /.*inactive.*/i }));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });
});
