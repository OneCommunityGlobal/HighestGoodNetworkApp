import React from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPasswordButton from '../../components/UserManagement/ResetPasswordButton';
import * as services from '../../services/userProfileService';
import { userProfileMock } from '../mockStates';
import { toast } from 'react-toastify';
jest.mock('react-toastify');

describe('reset password button ', () => {
  beforeEach(() => {
    render(<ResetPasswordButton isSmallButton user={userProfileMock} />);
  });
  describe('Structure', () => {
    it('should render a button', () => {
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });
  describe('Behavior', () => {
    it('should render modal after the user clicks the button', () => {
      // if (userProfileMock.email !== "devadmin@hgn.net") {
      userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // }
      // else {
      //   const alertMock = jest.spyOn(window, 'alert').mockImplementation();
      //   userEvent.click(screen.getByRole('button', { name: /reset password/i }))
      //   expect(alertMock).toHaveBeenCalledTimes(1)
      // }
    });
    it('should call resetPassword after the user click confirm on the modal', async () => {
      // if (userProfileMock.email !== "devadmin@hgn.net") {
      const spy = jest.spyOn(services, 'resetPassword').mockImplementation(() => Promise.resolve());

      userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      await userEvent.type(screen.getByLabelText(/new password/i), 'ABc@12345!', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'ABc@12345!', {
        allAtOnce: false,
      });
      userEvent.click(screen.getAllByRole('button', { name: /reset password/i })[1]);

      expect(spy).toHaveBeenCalled();
      // }
      // else {
      //   const alertMock = jest.spyOn(window, 'alert').mockImplementation();
      //   userEvent.click(screen.getByRole('button', { name: /reset password/i }))
      //   expect(alertMock).toHaveBeenCalledTimes(1)
      // }

    });
    it('should pop a alert after the reset is done', async () => {

      jest.spyOn(services, 'resetPassword').mockImplementation(() => Promise.resolve());

      userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      await userEvent.type(screen.getByLabelText(/new password/i), 'ABc@12345!', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'ABc@12345!', {
        allAtOnce: false,
      });
      userEvent.click(screen.getAllByRole('button', { name: /reset password/i })[1]);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Password reset action has been completed.');
      });
      // }
      // else {
      //   const alertMock = jest.spyOn(window, 'alert').mockImplementation();
      //   userEvent.click(screen.getByRole('button', { name: /reset password/i }))
      //   expect(alertMock).toHaveBeenCalledTimes(1)
      // }

    });
  });
});
