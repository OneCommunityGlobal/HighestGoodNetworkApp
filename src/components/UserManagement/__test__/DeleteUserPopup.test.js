import React from 'react';
import { screen, render } from '@testing-library/react';
import { renderWithProvider } from '../../../__tests__/utils';
import userEvent from '@testing-library/user-event';
import DeleteUserPopup from '../DeleteUserPopup';
import { UserDeleteType } from '../../../utils/enums';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { authMock, userProfileMock, rolesMock } from '../../../__tests__/mockStates';

import {
  USER_DELETE_CONFIRMATION_FIRST_LINE,
  USER_DELETE_CONFIRMATION_SECOND_LINE,
  USER_DELETE_DATA_FOREVER,
  USER_DELETE_DATA_INACTIVE,
  USER_DELETE_DATA_ARCHIVE,
  USER_DELETE_OPTION_HEADING
} from '../../../languages/en/messages';

const mockStore = configureStore([thunk]);
const onClose = jest.fn();
const onDelete = jest.fn();
let store;

const defaultProps = {
  open: true,
  onClose: onClose,
  onDelete: onDelete,
};

beforeEach(() => {
  store = mockStore({
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
    ...defaultProps,
  });
});

describe('delete user popup', () => {
  
  beforeEach(() => {
    renderWithProvider(<DeleteUserPopup {...defaultProps} />, {store});
  });
  describe('Structure', () => {
    it('should render the modal', () => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('should rendertwo close buttons', () => {
      expect(screen.getAllByRole('button', { name: /close/i })).toHaveLength(2);
    });
    it('should render one delete button', () => {
      expect(screen.getByRole('button', { name: /.*delete.*/i })).toBeInTheDocument();
    });
    it('should render one inactive button', () => {
      expect(screen.getByRole('button', { name: /.*inactive.*/i })).toBeInTheDocument();
    });
    it('should render one archive button', () => {
      expect(screen.getByRole('button', { name: /.*archiving.*/i })).toBeInTheDocument();
    });
  });
  describe('behavior', () => {
    it('should fire onClose() once the user clicks close buttons', () => {
      screen.getAllByRole('button', { name: /close/i }).forEach((button) => {
        userEvent.click(button);
      });
      expect(onClose).toHaveBeenCalledTimes(2);
    });
    it('should fire onDelete(HardDelete) once the user clicks the `delete` button', () => {
      userEvent.click(screen.getByRole('button', { name: /.*delete.*/i }));
      expect(onDelete).toHaveBeenCalledWith(UserDeleteType.HardDelete);
    });
    it('should fire onDelete(SoftDelete) once the user clicks the `archive` button', () => {
      userEvent.click(screen.getByRole('button', { name: /.*archiving.*/i }));
      expect(onDelete).toHaveBeenCalledWith(UserDeleteType.SoftDelete);
    });
    it('should fire onDelete(Inactive) once the user clicks the `inactive` button', () => {
      userEvent.click(screen.getByRole('button', { name: /.*inactive.*/i }));
      expect(onDelete).toHaveBeenCalledWith(UserDeleteType.Inactive);
    });
  });
});

describe('delete user popup additional tests', () => {

  beforeEach(() => {
    renderWithProvider(<DeleteUserPopup {...defaultProps} />, {store});
  });
  describe('Texts display', () => {
    it('should render USER_DELETE_CONFIRMATION_FIRST_LINE', () => {
      expect(screen.getByText(new RegExp(USER_DELETE_CONFIRMATION_FIRST_LINE, "i"))).toBeInTheDocument();
    });
    it('should render USER_DELETE_CONFIRMATION_SECOND_LINE', () => {
      expect(screen.getByText(new RegExp(USER_DELETE_CONFIRMATION_SECOND_LINE, "i"))).toBeInTheDocument();
    });
    it('should render USER_DELETE_DATA_FOREVER', () => {
      expect(screen.getByText(new RegExp(USER_DELETE_DATA_FOREVER, "i"))).toBeInTheDocument();
    });
    it('should render USER_DELETE_DATA_INACTIVE', () => {
      expect(screen.getByText(new RegExp(USER_DELETE_DATA_INACTIVE, "i"))).toBeInTheDocument();
    });
    it('should render USER_DELETE_DATA_ARCHIVE', () => {
      expect(screen.getByText(new RegExp(USER_DELETE_DATA_ARCHIVE, "i"))).toBeInTheDocument();
    });
    it('should render USER_DELETE_OPTION_HEADING', () => {
      expect(screen.getByText(new RegExp(USER_DELETE_OPTION_HEADING, "i"))).toBeInTheDocument();
    });
  });
  describe('more behaviors', () => {
    it('should not fire when close button is not clocked', () => {
      expect(onClose).toHaveBeenCalledTimes(0);
    });
    it('should fire onDelete(HardDelete) one time when the user clicks the `delete` button', () => {
      userEvent.click(screen.getByRole('button', { name: /.*delete.*/i }));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
    it('should fire onDelete(SoftDelete) one time when the user clicks the `archive` button', () => {
      userEvent.click(screen.getByRole('button', { name: /.*archiving.*/i }));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
    it('should fire onDelete(Inactive) one time when the user clicks the `inactive` button', () => {
      userEvent.click(screen.getByRole('button', { name: /.*inactive.*/i }));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });
});