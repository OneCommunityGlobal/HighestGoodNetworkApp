import React from "react";
import { shallow } from "enzyme";
import UserProfile from "../components/UserProfile";
import { toast } from "react-toastify";

describe("UserPage", () => {
  let userProfile;
  let userId = 1234;
  let props = { match: { params: { userId } } };
  beforeEach(() => {
    userProfile = shallow(<UserProfile {...props} />);
  });
  it("should call componentDidMount onload", () => {
    const spy = jest.spyOn(UserProfile.prototype, "componentDidMount");
    userProfile = shallow(<UserProfile {...props} />);
    expect(spy).toHaveBeenCalled();
  });

  it("should call getUserProfile onload", () => {
    let userProfileService = require("../services/userProfileService");
    const spy = jest.spyOn(userProfileService, "getUserProfile");
    userProfile.instance().componentDidMount();
    expect(spy).toHaveBeenCalledWith(userId);
  });

  it("should call error toast if an error was encountered while fetching user details", () => {
    let userProfileService = require("../services/userProfileService");
    let response = { status: 400 };
    userProfileService.getUserProfile = jest.fn(() => {
      throw { response };
    });
    toast.error = jest.fn();
    userProfile.instance().componentDidMount();
    let params = [
      "This is an invalid profile",
      { onClose: expect.any(Function) }
    ];
    expect(toast.error).toHaveBeenCalledWith(...params);
  });

  it("should call setState if user details were fetched successfully", async () => {
    let userProfileService = require("../services/userProfileService");
    let response = { status: 400 };
    userProfileService.getUserProfile = jest.fn(() => {
      return { response };
    });
    const spy = jest.spyOn(UserProfile.prototype, "setState");
    userProfile = shallow(<UserProfile {...props} />);
    await userProfile.instance().componentDidMount();
    expect(spy).toHaveBeenCalled();
  });

  it("should call error toast if an error was encountered while saving user edits", () => {
    let userProfileService = require("../services/userProfileService");
    let response = { status: 400 };
    userProfileService.editUserProfileData = jest.fn(() => {
      throw { response };
    });
    toast.error = jest.fn();
    userProfile.instance().handleSubmit();
    expect(toast.error).toHaveBeenCalled();
  });

  it("should call success toast if no error was encountered while saving user edits", async () => {
    let userProfileService = require("../services/userProfileService");
    let response = { status: 200 };
    userProfileService.editUserProfileData = jest.fn(() => {
      return { response };
    });
    toast.success = jest.fn();
    await userProfile.instance().handleSubmit();
    expect(toast.success).toHaveBeenCalledWith("Edits were successfully saved");
  });
});
