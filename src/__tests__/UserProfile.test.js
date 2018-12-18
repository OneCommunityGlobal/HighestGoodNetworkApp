import React from "react";
import { shallow, mount } from "enzyme";
import UserProfile from "../components/UserProfile";
import { getUserProfile } from "../services/userProfileService";
import { toast } from "react-toastify";

describe("UserPage", () => {
  it("should call componentDidMount onload", () => {
    const spy = jest.spyOn(UserProfile.prototype, "componentDidMount");
    let userProfile = shallow(<UserProfile />);
    expect(spy).toHaveBeenCalled();
  });

  it("should call getUserProfile onload", () => {
    let userId = 1234;
    let props = { match: { params: { userId } } };
    let userProfileService = require("../services/userProfileService");
    const spy = jest.spyOn(userProfileService, "getUserProfile");
    let userProfile = shallow(<UserProfile {...props} />);
    userProfile.instance().componentDidMount();
    expect(spy).toHaveBeenCalledWith(userId);
  });

  it("should call error toast if an error was encountered while fetching user details", () => {
    let userId = 1234;
    let props = { match: { params: { userId } } };
    let userProfileService = require("../services/userProfileService");
    let response = { status: 400 };
    userProfileService.getUserProfile = jest.fn(() => {
      throw { response };
    });
    toast.error = jest.fn();
    let userProfile = shallow(<UserProfile {...props} />);
    userProfile.instance().componentDidMount();
    let params = [
      "This is an invalid profile",
      { onClose: expect.any(Function) }
    ];
    expect(toast.error).toHaveBeenCalledWith(...params);
  });

  it("should call error toast if an error was encountered while saving user edits", () => {
    let userId = 1234;
    let props = { match: { params: { userId } } };
    let userProfileService = require("../services/userProfileService");
    let response = { status: 400 };
    userProfileService.editUserProfileData = jest.fn(() => {
      throw { response };
    });
    toast.error = jest.fn();
    let userProfile = shallow(<UserProfile {...props} />);
    userProfile.instance().handleSubmit();
    expect(toast.error).toHaveBeenCalled();
  });

  it("should call success toast if no error was encountered while saving user edits", async () => {
    let userId = 1234;
    let props = { match: { params: { userId } } };
    let userProfileService = require("../services/userProfileService");
    let response = { status: 200 };
    userProfileService.editUserProfileData = jest.fn(() => {
      return { response };
    });
    toast.success = jest.fn();
    let userProfile = shallow(<UserProfile {...props} />);
    await userProfile.instance().handleSubmit();
    expect(toast.success).toHaveBeenCalledWith("Edits were successfully saved");
  });
});
