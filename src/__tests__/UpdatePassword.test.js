import React from 'react';
import { Route } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { toast } from 'react-toastify';
import {
  cleanup, render, fireEvent, screen, waitForElementToBeRemoved, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockAxios from 'jest-mock-axios';
import UpdatePassword from '../components/UpdatePassword';
import { renderWithRouterMatch, renderWithProvider } from './utils';
import * as actions from '../actions/updatePassword';


// const userProfileService = require('../services/userProfileService');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
// jest.mock('../actions/updatePassword.js');
jest.mock('react-toastify');
// const setField = function (page, name, value) {
//   const mockEvent = {
//     currentTarget: {
//       name,
//       value,
//     },
//   };
//   page.find(`[name="${name}"]`).simulate('change', mockEvent);
// };

const errorMessages = {
  curentpasswordEmpty: '"Current Password" is not allowed to be empty',
  newpasswordEmpty: '"New Password" is not allowed to be empty',
  newpasswordInvalid:
    '"New Password" should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, and one number or special character',
  oldnewPasswordsSame: '"New Password" should not be same as old password',
  confirmpasswordMismatch: '"Confirm Password" must match new password',
  errorNon400Response:
    'Something went wrong. Please contact your administrator.',
};

const successMessages = {
  updatePasswordSuccessful:
    'Your password has been updated. You will be logged out and directed to login page where you can login with your new password.',
};

describe('Update Password Page', () => {
  let store;
  const userID = '5f31dcb9a1a909eadee0eecb';
  beforeEach(() => {
    store = mockStore({
      errors: '',
    });
    // store.dispatch = jest.fn();
    renderWithRouterMatch(
      <Route path="/updatepassword/:userId">
        {props => <UpdatePassword {...props} />}
      </Route>,
      {
        route: `/updatepassword/${userID}`,
        store,
      },
    );
  });
  afterEach(() => {
    // cleaning up the mess left behind the previous test
    mockAxios.reset();
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
      await userEvent.type(screen.getByLabelText(/current password:/i), 'abced', { allAtOnce: false });
      await userEvent.type(screen.getByLabelText(/new password:/i), 'ABCDabc123', { allAtOnce: false });
      await userEvent.type(screen.getByLabelText(/confirm password:/i), 'ABCDabc1234', { allAtOnce: false });
      expect(screen.getByText(errorMessages.confirmpasswordMismatch)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show error if old,new, and confirm passwords are same', async () => {
      await userEvent.type(screen.getByLabelText(/current password:/i), 'ABCDabc123', { allAtOnce: false });
      await userEvent.type(screen.getByLabelText(/new password:/i), 'ABCDabc123', { allAtOnce: false });
      await userEvent.type(screen.getByLabelText(/confirm password:/i), 'ABCDabc123', { allAtOnce: false });
      expect(screen.getByText(errorMessages.oldnewPasswordsSame)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Behavior', () => {
    // it('should call updatePassword on submit', async () => {
    //   const spyAction = jest.spyOn(actions, 'updatePassword');
    //   const newpassword = 'ABCdef@123';
    //   const confirmnewpassword = newpassword;
    //   const currentpassword = 'currentPassword1';
    //   await userEvent.type(screen.getByLabelText(/current password:/i), currentpassword, { allAtOnce: false });
    //   await userEvent.type(screen.getByLabelText(/new password:/i), newpassword, { allAtOnce: false });
    //   await userEvent.type(screen.getByLabelText(/confirm password:/i), confirmnewpassword, { allAtOnce: false });
    //   userEvent.click(screen.getByRole('button'), { name: /submit/i });
    //   expect(store.dispatch).toHaveBeenCalled();
    //   expect(store.dispatch).toHaveBeenCalledTimes(1);
    //   expect(spyAction).toHaveBeenCalled();
    //   expect(spyAction).toHaveBeenCalledWith(
    //     userID,
    //     { currentpassword, newpassword, confirmnewpassword },
    //   );
    // });

    it('should show error if api returned error', async () => {
      const spyAction = jest.spyOn(actions, 'updatePassword');
      // jest.clearAllMocks();
      const response = {
        status: 400,
        data: {
          error: 'Some Error',
        },
      };
      const newpassword = 'ABCdef@123';
      const confirmnewpassword = newpassword;
      const currentpassword = 'currentPassword1';
      await userEvent.type(screen.getByLabelText(/current password:/i), currentpassword, { allAtOnce: false });
      await userEvent.type(screen.getByLabelText(/new password:/i), newpassword, { allAtOnce: false });
      await userEvent.type(screen.getByLabelText(/confirm password:/i), confirmnewpassword, { allAtOnce: false });
      userEvent.click(screen.getByRole('button'), { name: /submit/i });
      expect(spyAction).toHaveBeenCalled();
      // expect(mockAxios.patch).toHaveBeenCalled();
      // mockAxios.mockResponse(response);
      // expect(toast.error).toHaveBeenCalledWith(errorMessages.errorNon400Response);
      // expect(toast.error).toHaveBeenCalled();
      // screen.debug();
      // screen.debug();
      // expect(screen.getByText(/some error/i)).toBeInTheDocument();
      // userProfileService.updatePassword = jest.fn(() => {
      // const response = {
      //   status: 400,
      //   data: {
      //     error: 'Some Error',
      //   },
      // };
      //   throw {
      //     response,
      //   };
      // });

      // const value = 'ABCdef@123';
      // setField(mountedPage, 'currentpassword', 'pop');
      // setField(mountedPage, 'newpassword', value);
      // setField(mountedPage, 'confirmnewpassword', value);
      // mountedPage.find('form').simulate('submit', {
      //   preventDefault: () => { },
      //   stopPropagation: () => { },
      // });
      // expect(mountedPage.instance().state.errors.currentpassword).toEqual(
      //   'Some Error',
      // );
    });

    //   it('should show a toastor error if API response was other than 200 and 400', async () => {
    //     toast.error = jest.fn();
    //     userProfileService.updatePassword = jest.fn(() => {
    //       const response = {
    //         status: 433,
    //         data: {
    //           message: 'updated',
    //         },
    //       };
    //       throw {
    //         response,
    //       };
    //     });

    //     const value = 'ABCdef@123';
    //     setField(mountedPage, 'currentpassword', 'pop');
    //     setField(mountedPage, 'newpassword', value);
    //     setField(mountedPage, 'confirmnewpassword', value);
    //     await mountedPage.find('form').simulate('submit', {
    //       preventDefault: () => { },
    //       stopPropagation: () => { },
    //     });

    //     const message = errorMessages.errorNon400Response;

    //     expect(toast.error).toHaveBeenCalledWith(message);
    //   });

    //   it('should show call toastr success with correct message and onClose param on success', async () => {
    //     toast.success = jest.fn();
    //     const response = {
    //       status: 200,
    //       data: { message: 'updated' },
    //     };

    //     userProfileService.updatePassword = jest.fn(() => response);

    //     const value = 'ABCdef@123';
    //     setField(mountedPage, 'currentpassword', 'pop');
    //     setField(mountedPage, 'newpassword', value);
    //     setField(mountedPage, 'confirmnewpassword', value);
    //     await mountedPage.find('form').simulate('submit', {
    //       preventDefault: () => { },
    //       stopPropagation: () => { },
    //     });

    //     const message = successMessages.updatePasswordSuccessful;
    //     const options = { onClose: expect.any(Function) };
    //     const successParams = [message, options];

    //     expect(toast.success).toHaveBeenCalledWith(...successParams);
    //   });
  });
});
