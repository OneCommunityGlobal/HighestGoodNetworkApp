import React from "react";
import { shallow } from "enzyme";
import Profile from "../components/Profile";

const setInputField = function(page, name, value) {
  let mockEvent = {
    currentTarget: {
      name,
      value
    }
  };
  page.find(`[name="${name}"]`).simulate("change", mockEvent);
};

const errorsMessages = {
  firstName_blank: '"First Name" is not allowed to be empty',
  firstName_minlength: '"First Name" length must be at least 2 characters long',
  lastName_blank: '"Last Name" is not allowed to be empty',
  lastName_minlength: '"Last Name" length must be at least 2 characters long',
  email_blank: '"Email" is not allowed to be empty',
  email_invalid: '"Email" must be a valid email',
  weeklyComittedHours_Nan: '"Weekly Committed Hours" must be a number',
  weeklyComittedHours_LessThan0:
    '"Weekly Committed Hours" must be larger than or equal to 0'
};

describe("Profile Page", () => {
  let profilePage;

  beforeEach(() => {
    let userProfile = { firstName: "ABC" };
    profilePage = shallow(<Profile userProfile={userProfile} />);
  });

  describe("Structure", () => {
    it("should have all user profile fields field", () => {
      expect(profilePage.find('[name="firstName"]').length).toBe(1);
      expect(profilePage.find('[name="lastName"]').length).toBe(1);
      expect(profilePage.find('[name="email"]').length).toBe(1);
      expect(profilePage.find('[name="password"]').length).toBe(0);
      expect(profilePage.find('[name="weeklyComittedHours"]').length).toBe(1);
      expect(profilePage.find('[name="profilePic"]').length).toBe(1);
      expect(profilePage.find('[name="bio"]').length).toBe(1);
      expect(
        profilePage.find('[name="infringments"]').length
      ).toBeLessThanOrEqual(5);
      expect(
        profilePage.find('[name="adminLinks"]').length
      ).toBeGreaterThanOrEqual(0);
      expect(
        profilePage.find('[name="personalLinks"]').length
      ).toBeGreaterThanOrEqual(0);
      expect(profilePage.find('[name="teams"]').length).toBeGreaterThanOrEqual(
        0
      );
      expect(
        profilePage.find('[name="projects"]').length
      ).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Behavior", () => {
    it("should show error if firstName is blank", () => {
      setInputField(profilePage, "firstName", "");
      expect(profilePage.instance().state.errors["firstName"]).toEqual(
        errorsMessages["firstName_blank"]
      );
    });
    it("should show error if firstName has only spaces", () => {
      setInputField(profilePage, "firstName", "     ");
      expect(profilePage.instance().state.errors["firstName"]).toEqual(
        errorsMessages["firstName_blank"]
      );
    });
    it("should show error if firstName is less than two charcaters", () => {
      setInputField(profilePage, "firstName", "a");
      expect(profilePage.instance().state.errors["firstName"]).toEqual(
        errorsMessages["firstName_minlength"]
      );
    });

    it("should show error if lastName is blank", () => {
      setInputField(profilePage, "lastName", "");
      expect(profilePage.instance().state.errors["lastName"]).toEqual(
        errorsMessages["lastName_blank"]
      );
    });
    it("should show error if lastName has only spaces", () => {
      setInputField(profilePage, "lastName", "     ");
      expect(profilePage.instance().state.errors["lastName"]).toEqual(
        errorsMessages["lastName_blank"]
      );
    });
    it("should show error if lastName is less than two charcaters", () => {
      setInputField(profilePage, "lastName", "a");
      expect(profilePage.instance().state.errors["lastName"]).toEqual(
        errorsMessages["lastName_minlength"]
      );
    });
    it("should show error if email is blank", () => {
      setInputField(profilePage, "email", "");
      expect(profilePage.instance().state.errors["email"]).toEqual(
        errorsMessages["email_blank"]
      );
    });
    it("should show error if email is invalid", () => {
      setInputField(profilePage, "email", "abcc");
      expect(profilePage.instance().state.errors["email"]).toEqual(
        errorsMessages["email_invalid"]
      );
    });
    it("should show error if weeklyComittedHours is not a number", () => {
      setInputField(profilePage, "weeklyComittedHours", "abcc");
      expect(
        profilePage.instance().state.errors["weeklyComittedHours"]
      ).toEqual(errorsMessages["weeklyComittedHours_Nan"]);
    });
    it("should show error if weeklyComittedHours is less than 0", () => {
      setInputField(profilePage, "weeklyComittedHours", -1);
      expect(
        profilePage.instance().state.errors["weeklyComittedHours"]
      ).toEqual(errorsMessages["weeklyComittedHours_LessThan0"]);
    });
  });
});

describe("Behavior for props passed", () => {
  let mountedPage;
  let firstName = "Jane";
  let lastName = "Doe";
  let email = "someemail@test.com";
  let isActive = false;
  let role = "Volunteer";
  let weeklyComittedHours = 100;
  let bio = "some Bio which is realy long";
  let links = [
    { Name: "Link1", Link: "https://www.google.com" },
    { Name: "This is Link2", Link: "https://www.facebook.com" }
  ];
  let targetUserId = 1234;
  let userProfile = {
    firstName,
    lastName,
    email,
    isActive,
    role,
    weeklyComittedHours,
    bio,
    adminLinks: links,
    personalLinks: links
  };

  beforeEach(() => {
    mountedPage = shallow(
      <Profile userProfile={userProfile} targetUserId={targetUserId} />
    );
  });
  it("should correctly render the firstName", () => {
    let field = mountedPage.find("[name='firstName']");
    expect(field.props().value).toEqual(firstName);
  });
  it("should correctly render a button to user's timelog", () => {
    let field = mountedPage.find("Link");
    expect(field.props().to).toEqual(`/timelog/${targetUserId}`);
  });
  it("should correctly render the lastName", () => {
    let field = mountedPage.find("[name='lastName']");
    expect(field.props().value).toEqual(lastName);
  });
  it("should correctly render the email", () => {
    let field = mountedPage.find("[name='email']");
    expect(field.props().value).toEqual(email);
  });
  it("should correctly render isActive", () => {
    let field = mountedPage.find("[name='isActive']");
    expect(field.props().value).toEqual(isActive);
  });
  it("should correctly render role", () => {
    let field = mountedPage.find("[name='role']");
    expect(field.props().value).toEqual(role);
  });
  it("should correctly render weeklyComittedHours", () => {
    let field = mountedPage.find("[name='weeklyComittedHours']");
    expect(field.props().value).toEqual(weeklyComittedHours);
  });
  it("should correctly render user's bio", () => {
    let field = mountedPage.find("[name='bio']");
    expect(field.props().value).toContain(bio);
  });
  it("should correctly render user's admin Links", () => {
    let field = mountedPage.find("[collection='adminLinks']");
    expect(field.props().data).toEqual(links);
  });
  it("should correctly render user's personal Links", () => {
    let field = mountedPage.find("[collection='personalLinks']");
    expect(field.props().data).toEqual(links);
  });
});
