import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPasswordButton from '../../components/UserManagement/ResetPasswordButton';
import * as services from '../../services/userProfileService';
import { userProfileMock } from '../mockStates';
// jest.mock('../../services/userProfileService.js');

describe('reset password button ', () => {
  beforeEach(() => {
    render(<ResetPasswordButton
      isSmallButton
      user={userProfileMock}
    />);
  });
  describe('Structure', () => {
    it('should render a button', () => {
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });
  describe('Behavior', () => {
    it('should render modal after the user clicks the button', () => {
      userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('should call resetPassword after the user click confirm on the modal', async () => {
      // services.resetPassword = jest.fn(() => Promise.resolve());
      const spy = jest.spyOn(services, 'resetPassword').mockImplementation(() => Promise.resolve());
      jest.spyOn(window, 'alert').mockImplementation(() => { });
      userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      await userEvent.type(screen.getByLabelText(/new password/i), 'ABc@12345!', { allAtOnce: false });
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'ABc@12345!', { allAtOnce: false });
      userEvent.click(screen.getAllByRole('button', { name: /reset password/i })[1]);
      expect(spy).toHaveBeenCalled();
    });
    it('should pop a alert after the reset is done', async () => {
      jest.spyOn(services, 'resetPassword').mockImplementation(() => Promise.resolve());
      const spy = jest.spyOn(window, 'alert').mockImplementation(() => { });
      userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      await userEvent.type(screen.getByLabelText(/new password/i), 'ABc@12345!', { allAtOnce: false });
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'ABc@12345!', { allAtOnce: false });
      userEvent.click(screen.getAllByRole('button', { name: /reset password/i })[1]);
      expect(spy).toHaveBeenCalled();
    });
  });
});
