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
    it("should have all user profile fields field_Admin", () => {
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
  let mountedPage_Admin;
  let mountedPage_Self;
  let mountedPage_Viewer;
  let firstName = "Jane";
  let lastName = "Doe";
  let email = "someemail@test.com";
  let isActive = false;
  let role = "Volunteer";
  let weeklyComittedHours = 100;
  let bio = "some Bio which is really long";
  let links = [
    { Name: "Link1", Link: "https://www.google.com" },
    { Name: "This is Link2", Link: "https://www.facebook.com" }
  ];
  let infringments = [];
  let targetUserId = 1234;
  let profilePic = "";
  let teams = [{ _id: 1, teamName: "team1" }, { _id: 2, teamName: "team2" }];
  let projects = [
    { _id: 1, projectName: "project1" },
    { _id: 2, projectName: "project2" }
  ];
  let userProfile = {
    firstName,
    lastName,
    email,
    isActive,
    role,
    weeklyComittedHours,
    bio,
    adminLinks: links,
    personalLinks: links,
    infringments,
    profilePic,
    teams,
    projects
  };

  beforeEach(() => {
    mountedPage_Admin = shallow(
      <Profile
        userProfile={userProfile}
        targetUserId={targetUserId}
        requestorRole="Administrator"
      />
    );
    mountedPage_Self = shallow(
      <Profile
        userProfile={userProfile}
        targetUserId={targetUserId}
        requestorId={targetUserId}
        requestorRole="Volunteer"
      />
    );
    mountedPage_Viewer = shallow(
      <Profile
        userProfile={userProfile}
        targetUserId={targetUserId + 100}
        requestorId={targetUserId}
        requestorRole="Volunteer"
      />
    );
  });
  it("should correctly render the firstName, editable by self and admin and readonly for viewer", () => {
    //Admin
    let field_Admin = mountedPage_Admin.find("[name='firstName']");
    expect(field_Admin.props().value).toEqual(firstName);
    expect(field_Admin.props().readOnly).toBeNull();

    //Self
    let field_Self = mountedPage_Self.find("[name='firstName']");
    expect(field_Self.props().value).toEqual(firstName);
    expect(field_Self.props().readOnly).toBeNull();

    //Viewer
    let field_Viewer = mountedPage_Viewer.find("[name='firstName']");
    expect(field_Viewer.props().value).toEqual(firstName);
    expect(field_Viewer.props().readOnly).toBeTruthy();
  });
  it("should render default profile pic if no profilePic was passed", () => {
    let field_Admin = mountedPage_Admin.find("Image");
    expect(field_Admin.props().src).toEqual("/defaultprofilepic.jpg");
  });

  it("should render edit button only if user is admin or self but not for other viewer", () => {
    let field_Admin = mountedPage_Admin.find("FileUpload");
    expect(field_Admin.length).toEqual(1);

    let field_Self = mountedPage_Self.find("FileUpload");
    expect(field_Self.length).toEqual(1);

    let field_Viewer = mountedPage_Viewer.find("FileUpload");
    expect(field_Viewer.length).toEqual(0);
  });

  it("should correctly render a button to user's timelog", () => {
    let field_Admin = mountedPage_Admin.find("Link");
    expect(field_Admin.props().to).toEqual(`/timelog/${targetUserId}`);
  });
  it("should correctly render the lastName", () => {
    let field_Admin = mountedPage_Admin.find("[name='lastName']");
    expect(field_Admin.props().value).toEqual(lastName);
  });
  it("should correctly render the email", () => {
    let field_Admin = mountedPage_Admin.find("[name='email']");
    expect(field_Admin.props().value).toEqual(email);
  });
  it("should correctly render isActive", () => {
    let field_Admin = mountedPage_Admin.find("[name='isActive']");
    expect(field_Admin.props().value).toEqual(isActive);
  });
  it("should correctly render role", () => {
    let field_Admin = mountedPage_Admin.find("[name='role']");
    expect(field_Admin.props().value).toEqual(role);
  });
  it("should correctly render weeklyComittedHours", () => {
    let field_Admin = mountedPage_Admin.find("[name='weeklyComittedHours']");
    expect(field_Admin.props().value).toEqual(weeklyComittedHours);
  });
  it("should correctly render user's bio", () => {
    let field_Admin = mountedPage_Admin.find("[name='bio']");
    expect(field_Admin.props().value).toContain(bio);
  });
  it("should correctly render user's admin Links", () => {
    let field_Admin = mountedPage_Admin.find("[collection='adminLinks']");
    expect(field_Admin.props().data).toEqual(links);
  });
  it("should correctly render user's personal Links", () => {
    let field_Admin = mountedPage_Admin.find("[collection='personalLinks']");
    expect(field_Admin.props().data).toEqual(links);
  });
  it("should correctly render exactly 5 infringments", () => {
    let field_Admin = mountedPage_Admin.find("RenderInfringment");
    expect(field_Admin.length).toEqual(5);
  });
  it("should correctly render teams correctly", () => {
    let field_Admin = mountedPage_Admin.find("Memberships[label='Team']");
    expect(field_Admin.props().data).toEqual(teams);
  });
  it("should correctly render projects correctly", () => {
    let field_Admin = mountedPage_Admin.find("Memberships[label='Project']");
    expect(field_Admin.props().data).toEqual(projects);
  });
});
