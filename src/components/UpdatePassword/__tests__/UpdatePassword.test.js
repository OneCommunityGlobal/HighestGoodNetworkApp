// @version 1.0.0
// Initial implementation of the UpdatePassword test suite.
// Semantic versioning follows major.minor.patch format.
// - Major: Breaking changes, incompatible API changes.
// - Minor: New features, but backward-compatible.
// - Patch: Bug fixes, performance improvements, or minor updates.

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

// API Endpoint for updating password
const url = ENDPOINTS.UPDATE_PASSWORD('5f31dcb9a1a909eadee0eecb');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// Mock the updatePassword action for testing
jest.mock('../../../actions/updatePassword.js');

// Setup mock server using MSW (Mock Service Worker)
const server = setupServer(
  // Request handler for PATCH request for password update
  rest.patch(url, (req, res, ctx) => {
    if (req.body.newpassword === 'newPassword8') {
      return res(ctx.status(200));
    }
    return res(ctx.status(400));
  }),
  // Default handler for all other requests
  rest.get('*', (req, res, ctx) => {
    console.error(
      `Please add request handler for ${req.url.toString()} in your MSW server requests.`,
    );
    return res(ctx.status(500), ctx.json({ error: 'You must add request handler.' }));
  }),
);

// Before all tests, start the server
beforeAll(() => server.listen());
// After all tests, close the server
afterAll(() => server.close());
// Reset handlers after each test to avoid test leakage
afterEach(() => {
  server.resetHandlers();
});

// Error messages used for validation and assertions
const errorMessages = {
  curentpasswordEmpty: '"Current Password" is not allowed to be empty',
  newpasswordEmpty: '"New Password" is not allowed to be empty',
  newpasswordInvalid:
    '"New Password" should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, one number and one special character',
  oldnewPasswordsSame: '"New Password" should not be same as old password',
  confirmpasswordMismatch: '"Confirm Password" must match new password',
  errorNon400Response: 'Something went wrong. Please contact your administrator.',
};

// Test suite for Update Password page
describe('Update Password Page', () => {
  let store;
  const userID = '5f31dcb9a1a909eadee0eecb';

  // Before each test, initialize the mock store and render the component
  beforeEach(() => {
    store = mockStore({
      errors: '',
      theme: { darkMode: true },
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

  // Test structure and layout of the page
  describe('Structure', () => {
    it('should have 3 input fields', () => {
      const inputs = screen.getAllByLabelText(/.*password/i);
      expect(inputs).toHaveLength(3);
    });
    it('should have 1 button field', () => {
      const button = screen.getAllByRole('button');
      expect(button).toHaveLength(1);
    });
    it('should have submit button in disabled state by default', () => {
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  // Test incorrect user inputs and validation errors
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
      expect(screen.getByText(errorMessages.newpasswordEmpty)).toBeInTheDocument();
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

    it('should show error if old, new, and confirm passwords are same', async () => {
      await userEvent.type(screen.getByLabelText(/current password:/i), 'ABCDabc123!', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/new password:/i), 'ABCDabc123!', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/confirm password:/i), 'ABCDabc123!', {
        allAtOnce: false,
      });
      expect(screen.getByText(errorMessages.oldnewPasswordsSame)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  // Test correct behavior on form submission
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
