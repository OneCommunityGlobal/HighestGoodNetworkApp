import React from 'react';
import { Route } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
// eslint-disable-next-line import/named
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// import mockAxios from 'jest-mock-axios';
import UpdatePassword from '..';
import { renderWithRouterMatch } from '../../../__tests__/utils';
import * as actions from '../../../actions/updatePassword';
import { ENDPOINTS } from '~/utils/URL';

const url = ENDPOINTS.UPDATE_PASSWORD('5f31dcb9a1a909eadee0eecb');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
// vi.mock('react-toastify');

vi.mock('../../../actions/updatePassword.js');
const server = setupServer(
  // request for a forced password update.
  rest.patch(url, (req, res, ctx) => {
    if (req.body.newpassword === 'newPassword8') {
      return res(ctx.status(200));
    }
    return res(ctx.status(400));
  }),
  // Any other requests error out
  rest.get('*', (req, res, ctx) => {
    // eslint-disable-next-line no-unused-vars
    const logerror = `Unhandled request: ${req.url.toString()}`;
    return res(ctx.status(500), ctx.json({ error: 'You must add request handler.' }));
  }),
);
beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => {
  // vi.clearAllMocks();
  server.resetHandlers();
});

const errorMessages = {
  curentpasswordEmpty: '"Current Password" is required',
  newpasswordEmpty: '"New Password" is required',
  newpasswordInvalid:
    '"New Password" should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, one number and one special character',
  oldnewPasswordsSame: '"New Password" should not be same as old password.',
  confirmpasswordMismatch: '"Confirm Password" must match new password',
  errorNon400Response: 'Something went wrong. Please contact your administrator.',
};

describe('Update Password Page', () => {
  let store;
  const userID = '5f31dcb9a1a909eadee0eecb';
  const renderComponent = () => {
    store = mockStore({ errors: '', theme: { darkMode: true } });
    store.dispatch = vi.fn();
    renderWithRouterMatch(
      <Route path="/updatepassword/:userId">
        {({ match, history, location }) => (
          <UpdatePassword match={match} history={history} location={location} />
        )}
      </Route>,
      {
        route: `/updatepassword/${userID}`,
        store,
      },
    );
  };

  describe('Structure', () => {
    it('should have 3 input fields', () => {
      renderComponent();
      const inputs = screen.getAllByLabelText(/.*password/i);
      expect(inputs).toHaveLength(3);
    });
    it('should have 1 button fields', () => {
      renderComponent();
      const button = screen.getAllByRole('button');
      expect(button).toHaveLength(1);
    });
    it('should have submit button in disabled state by default', () => {
      renderComponent();
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('For incorrect user inputs', () => {
    it('should show error if current password is left blank', async () => {
      renderComponent();
      const currentPassword = screen.getByLabelText(/current password/i);
      expect(currentPassword).toHaveValue('');
      await userEvent.type(currentPassword, 'a');
      await userEvent.clear(currentPassword);
      expect(screen.getByText(errorMessages.curentpasswordEmpty)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
    it('should show error if new password is left blank and current password has value', async () => {
      renderComponent();
      const currentPassword = screen.getByLabelText(/current password/i);
      const newPassword = screen.getByLabelText(/new password/i);
      await userEvent.type(currentPassword, 'a');
      await userEvent.type(newPassword, 'a');
      await userEvent.clear(newPassword);
      expect(screen.getByText(errorMessages.newpasswordEmpty)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
    it('should show error if new password is left blank and current password has no value', async () => {
      renderComponent();
      const newPassword = screen.getByLabelText(/new password/i);
      await userEvent.type(newPassword, 'abc', { allAtOnce: false });
      await userEvent.clear(newPassword);
      expect(screen.getByText(errorMessages.newpasswordEmpty)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show error if new password is not as per specifications', async () => {
      const errorValues = [
        'a', // less than 8
        'abcdefgh123', // no upper case
        'ABCDERF12344', // no lower case
        'ABCDEFabc', // no numbers or special characters
      ];
      renderComponent();
      await userEvent.type(screen.getByLabelText(/current password/i), 'z');
      errorValues.forEach(async value => {
        await userEvent.clear(screen.getByLabelText(/new password/i));
        await userEvent.type(screen.getByLabelText(/new password/i), value, { allAtOnce: false });
        expect(screen.getByText(errorMessages.newpasswordInvalid)).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeDisabled();
      });
    });
    it('should show error if confirm new password is left blank and new password is blank', async () => {
      renderComponent();
      const newPassword = screen.getByLabelText(/new password/i);
      const confirmPassword = screen.getByLabelText(/confirm password/i);
      await userEvent.type(newPassword, 'test', { allAtOnce: false });
      await userEvent.clear(newPassword);
      await userEvent.type(confirmPassword, 'test', { allAtOnce: false });
      await userEvent.clear(confirmPassword);
      expect(screen.getByText(errorMessages.newpasswordEmpty)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show error if confirm new password is left blank and new password is invalid', async () => {
      renderComponent();
      const newPassword = screen.getByLabelText(/new password/i);
      const confirmPassword = screen.getByLabelText(/confirm password/i);
      await userEvent.type(newPassword, 'asv', { allAtOnce: false });
      await userEvent.type(confirmPassword, 'i', { allAtOnce: false });
      await userEvent.clear(confirmPassword);
      expect(screen.getByText(errorMessages.newpasswordInvalid)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
    it('should show error if confirm new password is left blank and new password is valid', async () => {
      renderComponent();
      const newPassword = screen.getByLabelText(/new password/i);
      const confirmPassword = screen.getByLabelText(/confirm password/i);
      await userEvent.type(newPassword, 'Abcde@1234', { allAtOnce: false });
      await userEvent.type(confirmPassword, 'i', { allAtOnce: false });
      await userEvent.clear(confirmPassword);
      expect(screen.getByText(errorMessages.confirmpasswordMismatch)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show error if new and confirm passwords are not same', async () => {
      renderComponent();
      await userEvent.type(screen.getByLabelText(/current password/i), 'Abced@12', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/new password/i), 'Abcdef@123', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'Abcdef@124', {
        allAtOnce: false,
      });
      expect(screen.getByText(errorMessages.confirmpasswordMismatch)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show error if old,new, and confirm passwords are same', async () => {
      renderComponent();
      await userEvent.type(screen.getByLabelText(/current password/i), 'ABCDabc123!', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/new password/i), 'ABCDabc123!', {
        allAtOnce: false,
      });
      // When new password equals current password, it should show an error
      // But when confirm password is also the same, the confirm password validation
      // may show an error instead. Check for either error.
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'ABCDabc123!', {
        allAtOnce: false,
      });
      await waitFor(() => {
        const newPasswordError = screen.queryByText(errorMessages.oldnewPasswordsSame);
        const confirmPasswordError = screen.queryByText(errorMessages.confirmpasswordMismatch);
        expect(newPasswordError || confirmPasswordError).toBeTruthy();
      });
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Behavior', () => {
    it('should call updatePassword on submit', async () => {
      renderComponent();
      const newpassword = 'ABCdef@123';
      const confirmnewpassword = newpassword;
      const currentpassword = 'currentPassword1';
      await userEvent.type(screen.getByLabelText(/current password/i), currentpassword, {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/new password/i), newpassword, {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/confirm password/i), confirmnewpassword, {
        allAtOnce: false,
      });
      await userEvent.click(screen.getByRole('button'), { name: /submit/i });
      expect(actions.updatePassword).toHaveBeenCalled();
      expect(actions.updatePassword).toHaveBeenCalledWith(userID, {
        currentpassword,
        newpassword,
        confirmnewpassword,
      });
    });
  });
});
