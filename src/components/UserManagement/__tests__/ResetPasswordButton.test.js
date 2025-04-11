// import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { toast } from 'react-toastify';
import ResetPasswordButton from '../ResetPasswordButton';
import * as services from '../../../services/userProfileService';
import { themeMock, userProfileMock } from '../../../__tests__/mockStates';

const mockStore = configureStore([]);
const store = mockStore({ theme: themeMock });

jest.mock('react-toastify');

describe('reset password button ', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <ResetPasswordButton isSmallButton user={userProfileMock} canResetPassword />
      </Provider>,
    );
  });
  describe('Structure', () => {
    it('should render a button', () => {
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });
  describe('Behavior', () => {
    it('should render modal after the user clicks the button', () => {
      if (userProfileMock.email !== 'devadmin@hgn.net') {
        userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      } else {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation();
        userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        expect(alertMock).toHaveBeenCalledTimes(1);
      }
    });
    it('should call resetPassword after the user click confirm on the modal', async () => {
      if (userProfileMock.email !== 'devadmin@hgn.net') {
        const spy = jest
          .spyOn(services, 'resetPassword')
          .mockImplementation(() => Promise.resolve());

        userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        await userEvent.type(screen.getByLabelText(/new password/i), 'ABc@12345!', {
          allAtOnce: false,
        });
        await userEvent.type(screen.getByLabelText(/confirm password/i), 'ABc@12345!', {
          allAtOnce: false,
        });
        userEvent.click(screen.getAllByRole('button', { name: /reset password/i })[1]);

        expect(spy).toHaveBeenCalled();
      } else {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation();
        userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        expect(alertMock).toHaveBeenCalledTimes(1);
      }
    });
    it('should pop a alert after the reset is done', async () => {
      if (userProfileMock.email !== 'devadmin@hgn.net') {
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
      } else {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation();
        userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        expect(alertMock).toHaveBeenCalledTimes(1);
      }
    });
    it('should pop a alert when empty password input', async () => {
      if (userProfileMock.email !== 'devadmin@hgn.net') {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation();
        userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        await userEvent.type(screen.getByLabelText(/new password/i), '', {
          allAtOnce: false,
        });
        await userEvent.type(screen.getByLabelText(/confirm password/i), '', {
          allAtOnce: false,
        });
        userEvent.click(screen.getAllByRole('button', { name: /reset password/i })[1]);
        await waitFor(() => {
          expect(alertMock).toHaveBeenCalledTimes(1);
        });
      } else {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation();
        userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        expect(alertMock).toHaveBeenCalledTimes(1);
      }
    });
    it('should pop a alert when new password is less than 8 characters', async () => {
      if (userProfileMock.email !== 'devadmin@hgn.net') {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation();
        userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        await userEvent.type(screen.getByLabelText(/new password/i), '1234567', {
          allAtOnce: false,
        });
        await userEvent.type(screen.getByLabelText(/confirm password/i), '1234567', {
          allAtOnce: false,
        });
        userEvent.click(screen.getAllByRole('button', { name: /reset password/i })[1]);
        await waitFor(() => {
          expect(alertMock).toHaveBeenCalledTimes(1);
        });
      } else {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation();
        userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        expect(alertMock).toHaveBeenCalledTimes(1);
      }
    });
    it('should pop a alert when new password pair does not match', async () => {
      if (userProfileMock.email !== 'devadmin@hgn.net') {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation();
        userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        await userEvent.type(screen.getByLabelText(/new password/i), 'QAZ123wsxedc!@#', {
          allAtOnce: false,
        });
        await userEvent.type(screen.getByLabelText(/confirm password/i), 'QAZ123wsxedc!@^', {
          allAtOnce: false,
        });
        userEvent.click(screen.getAllByRole('button', { name: /reset password/i })[1]);
        await waitFor(() => {
          expect(alertMock).toHaveBeenCalledTimes(1);
        });
      } else {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation();
        userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        expect(alertMock).toHaveBeenCalledTimes(1);
      }
    });
  });
});
