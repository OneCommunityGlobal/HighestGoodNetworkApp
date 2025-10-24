import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import thunk from "redux-thunk";
import UserProfileEdit from "../UserProfileEdit";
import {
  userProfileMock,
  authMock,
  rolesMock,
  timeEntryMock,
  allTeamsMock,
  allProjectsMock,
  themeMock,
} from "../../../../__tests__/mockStates";

jest.mock("axios");

describe("<UserProfileEdit />", () => {
  let store;
  const mockStore = configureMockStore([thunk]);
  const mockProps = {
    auth: { user: { id: "testUser", role: "admin" }, ...authMock },
    userProfile: userProfileMock,
    role: rolesMock.role,
    getUserProfile: jest.fn().mockResolvedValue(userProfileMock),
    updateUserProfile: jest.fn(),
    getAllUserTeams: jest.fn(),
    hasPermission: jest.fn().mockReturnValue(true),
    match: { params: { userId: "12345" } },
    timeEntries: timeEntryMock,
    allTeams: allTeamsMock,
    allProjects: allProjectsMock,
    theme: themeMock,
  };

  beforeEach(() => {
    store = mockStore({
      auth: mockProps.auth,
      userProfile: mockProps.userProfile,
      role: mockProps.role,
      timeEntries: mockProps.timeEntries,
      allTeams: mockProps.allTeams,
      allProjects: mockProps.allProjects,
      theme: mockProps.theme,
    });
  });

  it("renders the UserProfileEdit component", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <UserProfileEdit {...mockProps} />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(mockProps.getUserProfile).toHaveBeenCalledWith("12345")
    );
    expect(screen.getByText(/Save Changes/i)).toBeInTheDocument();
  });

  it("displays loading spinner initially", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <UserProfileEdit {...mockProps} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("displays form fields after loading", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <UserProfileEdit {...mockProps} />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(mockProps.getUserProfile).toHaveBeenCalledWith("12345")
    );
    expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });

  it("prevents submission if form validation fails", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <UserProfileEdit {...mockProps} />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(mockProps.getUserProfile).toHaveBeenCalled());
    fireEvent.change(screen.getByPlaceholderText("First Name"), {
      target: { value: "" },
    });
    const saveChangesButtons = screen.getAllByText(/Save Changes/i);
    const saveChangesButton = saveChangesButtons.find(
      (button) => button.tagName === "BUTTON"
    );
    fireEvent.click(saveChangesButton);
    expect(mockProps.updateUserProfile).not.toHaveBeenCalled();
  });

  it("disables the save button when required fields are empty", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <UserProfileEdit {...mockProps} />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(mockProps.getUserProfile).toHaveBeenCalled());
    const firstNameInput = screen.getByPlaceholderText(/First Name/i);
    await userEvent.clear(firstNameInput);
    const saveButton = screen.getByRole("button", { name: /Save Changes/i });
    expect(saveButton).toBeDisabled();
  });

  it("displays a warning message when unsaved changes are detected", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <UserProfileEdit {...mockProps} />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(mockProps.getUserProfile).toHaveBeenCalled());
    const emailInput = screen.getByPlaceholderText(/Email/i);
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "newemail@example.com");
    await waitFor(() => {
      expect(
        screen.getByText(/You must click "Save Changes"/i)
      ).toBeInTheDocument();
    });
  });

  it("calls updateUserProfile when save button is clicked", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <UserProfileEdit {...mockProps} />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(mockProps.getUserProfile).toHaveBeenCalled());
    const saveButton = screen.getByRole("button", { name: /Save Changes/i });
    await userEvent.click(saveButton);
    expect(mockProps.updateUserProfile).toHaveBeenCalledTimes(1);
  });

  it("updates state when input fields change", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <UserProfileEdit {...mockProps} />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(mockProps.getUserProfile).toHaveBeenCalled());
    const firstNameInput = screen.getByPlaceholderText(/First Name/i);
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, "UpdatedFirstName");
    expect(firstNameInput).toHaveValue("UpdatedFirstName");
  });
});
