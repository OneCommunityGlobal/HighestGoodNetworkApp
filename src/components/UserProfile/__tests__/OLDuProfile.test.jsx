import React from 'react';
import { render } from '@testing-library/react';
import { toast } from 'react-toastify';
import UserProfile from '..';
// eslint-disable-next-line import/named
import { getUserProfile } from '../../../services/userProfileService';

test.skip('it skips tests because redux', () => {
  expect(reduxTests()).toBe(0);
});

// describe("UserPage", () => {
//   it("should call componentDidMount onload", () => {
//     const spy = vi.spyOn(UserProfile.prototype, "componentDidMount");
//     let userProfile = render(<UserProfile />);
//     expect(spy).toHaveBeenCalled();
//   });

//   it("should call getUserProfile onload", () => {
//     let userId = 1234;
//     let props = { match: { params: { userId } } };
//     let userProfileService = require("../services/userProfileService");
//     const spy = vi.spyOn(userProfileService, "getUserProfile");
//     let userProfile = render(<UserProfile {...props} />);
//     userProfile.instance().componentDidMount();
//     expect(spy).toHaveBeenCalledWith(userId);
//   });

//   it("should call error toast if an error was encountered while fetching user details", () => {
//     let userId = 1234;
//     let props = { match: { params: { userId } } };
//     let userProfileService = require("../services/userProfileService");
//     let response = { status: 400 };
//     userProfileService.getUserProfile = vi.fn(() => {
//       throw { response };
//     });
//     toast.error = vi.fn();
//     let userProfile = render(<UserProfile {...props} />);
//     userProfile.instance().componentDidMount();
//     let params = [
//       "This is an invalid profile",
//       { onClose: expect.any(Function) }
//     ];
//     expect(toast.error).toHaveBeenCalledWith(...params);
//   });

//   it("should call setState if user details were fetched successfully", async () => {
//     let userId = 1234;
//     let props = { match: { params: { userId } } };
//     let userProfileService = require("../services/userProfileService");
//     let response = { status: 400 };
//     userProfileService.getUserProfile = vi.fn(() => {
//       return { response };
//     });
//     const spy = vi.spyOn(UserProfile.prototype, "setState");
//     let userProfile = render(<UserProfile {...props} />);
//     await userProfile.instance().componentDidMount();
//     expect(spy).toHaveBeenCalled();
//   });

//   it("should call error toast if an error was encountered while saving user edits", () => {
//     let userId = 1234;
//     let props = { match: { params: { userId } } };
//     let userProfileService = require("../services/userProfileService");
//     let response = { status: 400 };
//     userProfileService.putUserProfileData = vi.fn(() => {
//       throw { response };
//     });
//     toast.error = vi.fn();
//     let userProfile = render(<UserProfile {...props} />);
//     userProfile.instance().handleSubmit();
//     expect(toast.error).toHaveBeenCalled();
//   });

//   it("should call success toast if no error was encountered while saving user edits", async () => {
//     let userId = 1234;
//     let props = { match: { params: { userId } } };
//     let userProfileService = require("../services/userProfileService");
//     let response = { status: 200 };
//     userProfileService.putUserProfileData = vi.fn(() => {
//       return { response };
//     });
//     toast.success = vi.fn();
//     let userProfile = render(<UserProfile {...props} />);
//     await userProfile.instance().handleSubmit();
//     expect(toast.success).toHaveBeenCalledWith("Edits were successfully saved");
//   });
// });
