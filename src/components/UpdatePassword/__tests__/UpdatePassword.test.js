import React from 'react';
import { Route } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// import mockAxios from 'jest-mock-axios';
import UpdatePassword from '..';
import { renderWithRouterMatch } from '../../../__tests__/utils';
import * as actions from '../../../actions/updatePassword';
import { ENDPOINTS } from '../../../utils/URL';

const url = ENDPOINTS.UPDATE_PASSWORD('5f31dcb9a1a909eadee0eecb');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
// jest.mock('react-toastify');

jest.mock('../../../actions/updatePassword.js');
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
    console.error(
      `Please add request handler for ${req.url.toString()} in your MSW server requests.`,
    );
    return res(ctx.status(500), ctx.json({ error: 'You must add request handler.' }));
  }),
);
beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => {
  // jest.clearAllMocks();
  server.resetHandlers();
});

const errorMessages = {
  curentpasswordEmpty: '"Current Password" is not allowed to be empty',
  newpasswordEmpty: '"New Password" is not allowed to be empty',
  newpasswordInvalid:
    '"New Password" should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, and one number or special character',
  oldnewPasswordsSame: '"New Password" should not be same as old password',
  confirmpasswordMismatch: '"Confirm Password" must match new password',
  errorNon400Response: 'Something went wrong. Please contact your administrator.',
};

describe('Update Password Page', () => {
  let store;
  const userID = '5f31dcb9a1a909eadee0eecb';
  beforeEach(() => {
    store = mockStore({
      errors: '',
    });
    store.dispatch = jest.fn();
    renderWithRouterMatch(
      <Route path="/updatepassword/:userId">{(props) => <UpdatePassword {...props} />}</Route>,
      {
        route: `/updatepassword/${userID}`,
        store,
      },
    );
  });

  describe('Structure', () => {
    it('should have 3 input fields', () => {
      const inputs = screen.getAllByLabelText(/.*password/i);
      expect(inputs).toHaveLength(3);
    });
    it('should have 1 button fields', () => {
      const button = screen.getAllByRole('button');
      expect(button).toHaveLength(1);
    });
    it('should have submit button in disabled state by default', () => {
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('For incorrect user inputs', () => {
    it('should show error if current password is left blank', () => {
      const currentPassword = screen.getByLabelText(/current password:/i);
      expect(currentPassword).toHaveValue('');
      userEvent.type(currentPassword, 'a');
      userEvent.clear(currentPassword);
      expect(screen.getByText(errorMessages.curentpasswordEmpty)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
    it('should show error if new password is left blank and current password has value', () => {
      const currentPassword = screen.getByLabelText(/current password:/i);
      const newPassword = screen.getByLabelText(/new password:/i);
      userEvent.type(currentPassword, 'a');
      userEvent.type(newPassword, 'a');
      userEvent.clear(newPassword);
      expect(screen.getByText(errorMessages.newpasswordEmpty)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
    it('should show error if new password is left blank and current password has no value', async () => {
      const newPassword = screen.getByLabelText(/new password:/i);
      await userEvent.type(newPassword, 'abc', { allAtOnce: false });
      userEvent.clear(newPassword);
      expect(screen.getByText(errorMessages.curentpasswordEmpty)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show error if new password is not as per specifications', () => {
      const errorValues = [
        'a', // less than 8
        'abcdefgh123', // no upper case
        'ABCDERF12344', // no lower case
        'ABCDEFabc', // no numbers or special characters
      ];
      userEvent.type(screen.getByLabelText(/current password:/i), 'z');
      errorValues.forEach((value) => {
        userEvent.clear(screen.getByLabelText(/new password:/i));
        userEvent.type(screen.getByLabelText(/new password:/i), value, { allAtOnce: false });
        expect(screen.getByText(errorMessages.newpasswordInvalid)).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeDisabled();
      });
    });
    it('should show error if confirm new password is left blank and new password is blank', async () => {
      const newPassword = screen.getByLabelText(/new password:/i);
      const confirmPassword = screen.getByLabelText(/confirm password:/i);
      await userEvent.type(newPassword, 'test', { allAtOnce: false });
      userEvent.clear(newPassword);
      await userEvent.type(confirmPassword, 'test', { allAtOnce: false });
      userEvent.clear(confirmPassword);
      expect(screen.getByText(errorMessages.newpasswordEmpty)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show error if confirm new password is left blank and new password is invalid', async () => {
      const newPassword = screen.getByLabelText(/new password/i);
      const confirmPassword = screen.getByLabelText(/confirm password:/i);
      await userEvent.type(newPassword, 'asv', { allAtOnce: false });
      await userEvent.type(confirmPassword, 'i', { allAtOnce: false });
      userEvent.clear(confirmPassword);
      expect(screen.getByText(errorMessages.newpasswordInvalid)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
    it('should show error if confirm new password is left blank and new password is valid', async () => {
      const newPassword = screen.getByLabelText(/new password/i);
      const confirmPassword = screen.getByLabelText(/confirm password:/i);
      await userEvent.type(newPassword, 'Abcde@1234', { allAtOnce: false });
      await userEvent.type(confirmPassword, 'i', { allAtOnce: false });
      userEvent.clear(confirmPassword);
      expect(screen.getByText(errorMessages.confirmpasswordMismatch)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show error if new and confirm passwords are not same', async () => {
      await userEvent.type(screen.getByLabelText(/current password:/i), 'Abced@12', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/new password:/i), 'Abcdef@123', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/confirm password:/i), 'Abcdef@124', {
        allAtOnce: false,
      });
      expect(screen.getByText(errorMessages.confirmpasswordMismatch)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show error if old,new, and confirm passwords are same', async () => {
      await userEvent.type(screen.getByLabelText(/current password:/i), 'ABCDabc123', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/new password:/i), 'ABCDabc123', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/confirm password:/i), 'ABCDabc123', {
        allAtOnce: false,
      });
      expect(screen.getByText(errorMessages.oldnewPasswordsSame)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Behavior', () => {
    it('should call updatePassword on submit', async () => {
      const newpassword = 'ABCdef@123';
      const confirmnewpassword = newpassword;
      const currentpassword = 'currentPassword1';
      await userEvent.type(screen.getByLabelText(/current password:/i), currentpassword, {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/new password:/i), newpassword, {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/confirm password:/i), confirmnewpassword, {
        allAtOnce: false,
      });
      userEvent.click(screen.getByRole('button'), { name: /submit/i });
      expect(actions.updatePassword).toHaveBeenCalled();
      expect(actions.updatePassword).toHaveBeenCalledWith(userID, {
        currentpassword,
        newpassword,
        confirmnewpassword,
      });
    });
  });
});
