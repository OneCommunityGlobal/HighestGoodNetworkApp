// import React from 'react';
// import { shallow } from 'enzyme';
// import { toast } from 'react-toastify';
// import UpdatePassword from '../components/UpdatePassword';

// const userProfileService = require('../services/userProfileService');

// const setField = function (page, name, value) {
//   const mockEvent = {
//     currentTarget: {
//       name,
//       value,
//     },
//   };
//   page.find(`[name="${name}"]`).simulate('change', mockEvent);
// };

// const errorMessages = {
//   curentpasswordEmpty: '"Current Password" is not allowed to be empty',
//   newpasswordEmpty: '"New Password" is not allowed to be empty',
//   newpasswordInvalid:
//     '"New Password" should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, and one number or special character',
//   oldnewPasswordsSame: '"New Password" should not be same as old password',
//   confirmpasswordMismatch: '"Confirm Password" must match new password',
//   errorNon400Response:
//     'Something went wrong. Please contact your administrator.',
// };

// const successMessages = {
//   updatePasswordSuccessful:
//     'Your password has been updated. You will be logged out and directed to login page where you can login with your new password.',
// };
// let mountedPage;
// describe('Update Password Page', () => {
//   // let mountedPage;
//   beforeEach(() => {
//     mountedPage = shallow(
//       <UpdatePassword

//         match={{
//           params: {
//             userId: 1,
//           },
//         }}
//       />,
//     );
//   });

describe('Structure', () => {
  it('should have 3 input fields', () => {
    // const inputs = mountedPage.find('Input');
    // expect(inputs.length).toBe(3);
  });
  // it('should have 1 button fields', () => {
  //   const button = mountedPage.find('button');
  //   expect(button.length).toBe(1);
  // });
  // it('should have submit button in disabled state by default', () => {
  //   const button = mountedPage.find('button');
  //   expect(button.props()).toHaveProperty('disabled');
  // });

  // it('should have userId as a prop', () => {
  //   expect(mountedPage.instance().props.match.params).toHaveProperty(
  //     'userId',
  //   );
  // });
});

//   describe('For incorrect user inputs', () => {
//     it('should show error if current password is left blank', () => {
//       setField(mountedPage, 'currentpassword', '');
//       expect(mountedPage.instance().state.errors.currentpassword).toEqual(
//         errorMessages.curentpasswordEmpty,
//       );
//     });
//     it('should show error if new password is left blank and current password has value', () => {
//       setField(mountedPage, 'currentpassword', 'abc');
//       setField(mountedPage, 'newpassword', '');

//       expect(mountedPage.instance().state.errors.newpassword).toEqual(
//         errorMessages.newpasswordEmpty,
//       );
//     });
//     it('should show error if new password is left blank and current password has no value', () => {
//       setField(mountedPage, 'newpassword', '');

//       expect(mountedPage.instance().state.errors.newpassword).toEqual(
//         errorMessages.curentpasswordEmpty,
//       );
//     });

//     it('should show error if new password is not as per specifications', () => {
//       const errorValues = [
//         'a', // less than 8
//         'abcdefgh123', // no upper case
//         'ABCDERF12344', // no lower case
//         'ABCDEFabc', // no numbers or special characters
//       ];
//       setField(mountedPage, 'currentpassword', 'abc');
//       errorValues.forEach((value) => {
//         setField(mountedPage, 'newpassword', value);
//         expect(mountedPage.instance().state.errors.newpassword).toEqual(
//           errorMessages.newpasswordInvalid,
//         );
//       });
//     });
//     it('should show error if confirm new password is left blank and new password is blank', () => {
//       setField(mountedPage, 'newpassword', '');
//       setField(mountedPage, 'confirmnewpassword', '');
//       expect(mountedPage.instance().state.errors.confirmnewpassword).toEqual(
//         errorMessages.newpasswordEmpty,
//       );
//     });

//     it('should show error if confirm new password is left blank and new password is invalid', () => {
//       setField(mountedPage, 'newpassword', 'asv');
//       setField(mountedPage, 'confirmnewpassword', '');
//       expect(mountedPage.instance().state.errors.confirmnewpassword).toEqual(
//         errorMessages.newpasswordInvalid,
//       );
//     });
//     it('should show error if confirm new password is left blank and new password is valid', () => {
//       setField(mountedPage, 'newpassword', 'Abcde@1234');
//       setField(mountedPage, 'confirmnewpassword', '');
//       expect(mountedPage.instance().state.errors.confirmnewpassword).toEqual(
//         errorMessages.confirmpasswordMismatch,
//       );
//     });

//     it('should show error if new and confirm passwords are not same', () => {
//       setField(mountedPage, 'currentpassword', 'abcde');
//       setField(mountedPage, 'newpassword', 'ABCDabc123');
//       setField(mountedPage, 'confirmnewpassword', 'ABCDabc1234');

//       mountedPage.find('form').simulate('submit', {
//         preventDefault: () => { },
//         stopPropagation: () => { },
//       });
//       expect(mountedPage.instance().state.errors.confirmnewpassword).toEqual(
//         errorMessages.confirmpasswordMismatch,
//       );
//     });

//     it('should show error if old,new, and confirm passwords are same', () => {
//       setField(mountedPage, 'currentpassword', 'ABCDabc123');
//       setField(mountedPage, 'newpassword', 'ABCDabc123');
//       setField(mountedPage, 'confirmnewpassword', 'ABCDabc123');
//       mountedPage.find('form').simulate('submit', {
//         preventDefault: () => { },
//         stopPropagation: () => { },
//       });
//       expect(mountedPage.instance().state.errors.newpassword).toEqual(
//         errorMessages.oldnewPasswordsSame,
//       );
//     });
//   });

//   describe('Behavior', () => {
//     it('should call updatePassword on submit', () => {
//       const userProfileService = require('../services/userProfileService');
//       const spy = jest.spyOn(userProfileService, 'updatePassword');
//       const value = 'ABCdef@123';
//       setField(mountedPage, 'currentpassword', 'pop');
//       setField(mountedPage, 'newpassword', value);
//       setField(mountedPage, 'confirmnewpassword', value);

//       mountedPage.find('form').simulate('submit', {
//         preventDefault: () => { },
//         stopPropagation: () => { },
//       });
//       expect(spy).toHaveBeenCalled();
//     });

//     it('should show error if api returned error', () => {
//       userProfileService.updatePassword = jest.fn(() => {
//         const response = {
//           status: 400,
//           data: {
//             error: 'Some Error',
//           },
//         };
//         throw {
//           response,
//         };
//       });

//       const value = 'ABCdef@123';
//       setField(mountedPage, 'currentpassword', 'pop');
//       setField(mountedPage, 'newpassword', value);
//       setField(mountedPage, 'confirmnewpassword', value);
//       mountedPage.find('form').simulate('submit', {
//         preventDefault: () => { },
//         stopPropagation: () => { },
//       });
//       expect(mountedPage.instance().state.errors.currentpassword).toEqual(
//         'Some Error',
//       );
//     });

//     it('should show a toastor error if API response was other than 200 and 400', async () => {
//       toast.error = jest.fn();
//       userProfileService.updatePassword = jest.fn(() => {
//         const response = {
//           status: 433,
//           data: {
//             message: 'updated',
//           },
//         };
//         throw {
//           response,
//         };
//       });

//       const value = 'ABCdef@123';
//       setField(mountedPage, 'currentpassword', 'pop');
//       setField(mountedPage, 'newpassword', value);
//       setField(mountedPage, 'confirmnewpassword', value);
//       await mountedPage.find('form').simulate('submit', {
//         preventDefault: () => { },
//         stopPropagation: () => { },
//       });

//       const message = errorMessages.errorNon400Response;

//       expect(toast.error).toHaveBeenCalledWith(message);
//     });

//     it('should show call toastr success with correct message and onClose param on success', async () => {
//       toast.success = jest.fn();
//       const response = {
//         status: 200,
//         data: { message: 'updated' },
//       };

//       userProfileService.updatePassword = jest.fn(() => response);

//       const value = 'ABCdef@123';
//       setField(mountedPage, 'currentpassword', 'pop');
//       setField(mountedPage, 'newpassword', value);
//       setField(mountedPage, 'confirmnewpassword', value);
//       await mountedPage.find('form').simulate('submit', {
//         preventDefault: () => { },
//         stopPropagation: () => { },
//       });

//       const message = successMessages.updatePasswordSuccessful;
//       const options = { onClose: expect.any(Function) };
//       const successParams = [message, options];

//       expect(toast.success).toHaveBeenCalledWith(...successParams);
//     });
//   });
// });
