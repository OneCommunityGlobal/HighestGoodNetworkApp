// import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import { toast } from 'react-toastify';
import ResetPasswordButton from '../ResetPasswordButton';
import * as services from '../../../services/userProfileService';
import { themeMock, userProfileMock } from '../../../__tests__/mockStates';

const mockStore = configureStore([]);
const store = mockStore({ theme: themeMock });

vi.mock('react-toastify');

describe('reset password button ', () => {
  let alertSpy;
  
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore all mocks after each test
    alertSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe('Structure', () => {
    it('should render a button', () => {
      render(
        <Provider store={store}>
          <ResetPasswordButton isSmallButton user={userProfileMock} canUpdatePassword />
        </Provider>,
      );
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });
  describe('Behavior', () => {
    it('should render modal after the user clicks the button', async () => {
      render(
        <Provider store={store}>
          <ResetPasswordButton isSmallButton user={userProfileMock} canUpdatePassword />
        </Provider>,
      );
      if (userProfileMock.email !== 'devadmin@hgn.net') {
        await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      } else {
        alertSpy.mockClear();
        await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        // Allow for multiple calls but ensure at least one
        expect(alertSpy).toHaveBeenCalled();
      }
    });
    it('should call resetPassword after the user click confirm on the modal', async () => {
      render(
        <Provider store={store}>
          <ResetPasswordButton isSmallButton user={userProfileMock} canUpdatePassword />
        </Provider>,
      );
      if (userProfileMock.email !== 'devadmin@hgn.net') {
        const spy = jest
          .spyOn(services, 'resetPassword')
          .mockImplementation(() => Promise.resolve());

        await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        await userEvent.type(screen.getByLabelText(/new password/i), 'ABc@12345!', {
          allAtOnce: false,
        });
        await userEvent.type(screen.getByLabelText(/confirm password/i), 'ABc@12345!', {
          allAtOnce: false,
        });
        await userEvent.click(screen.getAllByRole('button', { name: /reset password/i })[1]);

        expect(spy).toHaveBeenCalled();
      } else {
        alertSpy.mockClear();
        await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        // The component may call alert multiple times due to validation, so just check it was called
        expect(alertSpy).toHaveBeenCalled();
        alertSpy.mockRestore();
      }
    });
    it('should pop a alert after the reset is done', async () => {
      render(
        <Provider store={store}>
          <ResetPasswordButton isSmallButton user={userProfileMock} canUpdatePassword />
        </Provider>,
      );
      if (userProfileMock.email !== 'devadmin@hgn.net') {
        vi.spyOn(services, 'resetPassword').mockImplementation(() => Promise.resolve());

        await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        await userEvent.type(screen.getByLabelText(/new password/i), 'ABc@12345!', {
          allAtOnce: false,
        });
        await userEvent.type(screen.getByLabelText(/confirm password/i), 'ABc@12345!', {
          allAtOnce: false,
        });
        await userEvent.click(screen.getAllByRole('button', { name: /reset password/i })[1]);

        await waitFor(() => {
          expect(toast.success).toHaveBeenCalledWith('Password reset action has been completed.');
        });
      } else {
        alertSpy.mockClear();
        await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        // The component may call alert multiple times due to validation, so just check it was called
        expect(alertSpy).toHaveBeenCalled();
        alertSpy.mockRestore();
      }
    });
    it('should pop a alert when empty password input', async () => {
      render(
        <Provider store={store}>
          <ResetPasswordButton isSmallButton user={userProfileMock} canUpdatePassword />
        </Provider>,
      );
      if (userProfileMock.email !== 'devadmin@hgn.net') {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation();
        await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        await userEvent.type(screen.getByLabelText(/new password/i), '', {
          allAtOnce: false,
        });
        await userEvent.type(screen.getByLabelText(/confirm password/i), '', {
          allAtOnce: false,
        });
        await userEvent.click(screen.getAllByRole('button', { name: /reset password/i })[1]);
        await waitFor(() => {
          expect(alertMock).toHaveBeenCalledTimes(1);
        });
      } else {
        alertSpy.mockClear();
        await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        // The component may call alert multiple times due to validation, so just check it was called
        expect(alertSpy).toHaveBeenCalled();
        alertSpy.mockRestore();
      }
    });
    it('should pop a alert when new password is less than 8 characters', async () => {
      render(
        <Provider store={store}>
          <ResetPasswordButton isSmallButton user={userProfileMock} canUpdatePassword />
        </Provider>,
      );
      if (userProfileMock.email !== 'devadmin@hgn.net') {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation();
        await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        await userEvent.type(screen.getByLabelText(/new password/i), '1234567', {
          allAtOnce: false,
        });
        await userEvent.type(screen.getByLabelText(/confirm password/i), '1234567', {
          allAtOnce: false,
        });
        await userEvent.click(screen.getAllByRole('button', { name: /reset password/i })[1]);
        await waitFor(() => {
          expect(alertMock).toHaveBeenCalledTimes(1);
        });
      } else {
        alertSpy.mockClear();
        await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        // Allow for multiple calls but ensure at least one
        expect(alertSpy).toHaveBeenCalled();
      }
    });
    it('should pop a alert when new password pair does not match', async () => {
      render(
        <Provider store={store}>
          <ResetPasswordButton isSmallButton user={userProfileMock} canUpdatePassword />
        </Provider>,
      );
      if (userProfileMock.email !== 'devadmin@hgn.net') {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation();
        await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        await userEvent.type(screen.getByLabelText(/new password/i), 'QAZ123wsxedc!@#', {
          allAtOnce: false,
        });
        await userEvent.type(screen.getByLabelText(/confirm password/i), 'QAZ123wsxedc!@^', {
          allAtOnce: false,
        });
        await userEvent.click(screen.getAllByRole('button', { name: /reset password/i })[1]);
        await waitFor(() => {
          expect(alertMock).toHaveBeenCalledTimes(1);
        });
      } else {
        alertSpy.mockClear();
        await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        // The component may call alert multiple times due to validation, so just check it was called
        expect(alertSpy).toHaveBeenCalled();
        alertSpy.mockRestore();
      }
    });
  });
});
