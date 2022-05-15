import React from 'react';
import { Route } from 'react-router-dom';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  authMock,
  userProfileMock,
  timeEntryMock,
  userProjectMock,
  allProjectsMock,
  allTeamsMock,
} from '../mockStates';
import { renderWithRouterMatch } from '../utils';
import UserProfileEdit from '../../components/UserProfile/UserProfileEdit/UserProfileEdit.container';
import * as actions from '../../actions/userProfile';

jest.mock('../../actions/allTeamsAction.js');
jest.mock('../../actions/userProfile.js');
jest.mock('../../actions/team.js');
jest.mock('../../actions/projects.js');

const mockStore = configureMockStore([thunk]);
describe('user profile page', () => {
  const userId = authMock.user.userid;
  let store;
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProfile: userProfileMock,
      user: authMock.user,
      timeEntries: timeEntryMock,
      userProjects: userProjectMock,
      allProjects: allProjectsMock,
      allTeams: allTeamsMock,
      // state: {
      //   authMoc  k, userProfileMock, timeEntryMock, userProjectMock, allProjectsMock, allTeamsMock,
      // },
    });
    store.dispatch = jest.fn();
    renderWithRouterMatch(
      <Route path="/userprofileedit/:userId">{(props) => <UserProfileEdit {...props} />}</Route>,
      {
        route: `/userprofileedit/${userId}`,
        store,
      },
    );
  });
  describe('Structure', () => {
    it('should render a change photo button', () => {
      // console.log(store.getState().allTeams);
      expect(screen.getByText(/change photo/i)).toBeInTheDocument();
    });
    it('should render a profile image', () => {
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
    it('should render the correct profile image', () => {
      expect(screen.getByRole('img')).toHaveAttribute('src', userProfileMock.profilePic);
    });
    it('should render a first name field', () => {
      expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
    });
    it('should render the correct first name', () => {
      expect(screen.getByPlaceholderText(/first name/i)).toHaveValue(userProfileMock.firstName);
    });

    it('should render a last name field', () => {
      expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
    });
    it('should render the correct last name', () => {
      expect(screen.getByPlaceholderText(/last name/i)).toHaveValue(userProfileMock.lastName);
    });

    it('should render multiple bluesquares', () => {
      expect(screen.getAllByRole('button', { name: /\d\d\d\d-\d\d-\d\d/i })).toHaveLength(
        userProfileMock.infringments.length,
      );
    });
    it('should render a email field', () => {
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    });
    it('should render the correct email', () => {
      expect(screen.getByPlaceholderText(/email/i)).toHaveValue(userProfileMock.email);
    });
    it('should render 3 toggle switches', () => {
      expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    });
    it('should render a phone number field', () => {
      expect(screen.getByPlaceholderText(/phone/i)).toBeInTheDocument();
    });
    it('should render the correct phone number', () => {
      expect(screen.getByPlaceholderText(/phone/i)).toHaveValue(
        parseInt(userProfileMock.phoneNumber, 10),
      );
    });
    it('should render an assign team button', () => {
      expect(screen.getByRole('button', { name: /assign team/i })).toBeInTheDocument();
    });
    it('should render delete buttons', () => {
      expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(
        userProfileMock.teams.length + userProfileMock.projects.length,
      );
    });
    it('should render `Basic Information` Tab', () => {
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
    });
    it('should render `Volunteering Times` Tab', () => {
      expect(screen.getByText('Volunteering Times')).toBeInTheDocument();
    });
    it('should render Teams tab', () => {
      expect(screen.getAllByText('Teams')).toHaveLength(2);
    });
    it('should render Projects tab', () => {
      expect(screen.getAllByText('Projects')).toHaveLength(2);
    });
    it('should render multiple links', () => {
      expect(screen.getAllByRole('link')).toHaveLength(
        userProfileMock.personalLinks.length + userProfileMock.adminLinks.length + 1,
      );
    });
    it('should render a edit link button', () => {
      expect(screen.getByTestId('edit-link')).toBeInTheDocument();
    });
    it('should render one save change button', () => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });
    it('should render one cancel button', () => {
      expect(screen.getByRole('link', { name: /cancel/i })).toBeInTheDocument();
    });
  });
  describe('Behavior', () => {
    it('should fire toggleTab to Basic Information tab when the user clicks on the Basic Information tab link', async () => {
      userEvent.click(screen.getByText(/basic information/i));
    });
    it('should fire toggleTab to Volunteering Times tab when the user clicks on the Basic Information tab link', async () => {
      userEvent.click(screen.getByText(/volunteering times/i));
    });
    it('should fire toggleTab to Teams tab when the user clicks on the Teams tab link', async () => {
      userEvent.click(screen.getAllByText(/teams/i)[0]);
    });
    it('should fire toggleTab to Projects tab when the user clicks on the Projects tab link', async () => {
      userEvent.click(screen.getAllByText(/projects/i)[0]);
    });
    it('should fire toggleTab to Edit History Tabs tab when the user clicks on the Edit History tab link', async () => {
      userEvent.click(screen.getByTestId('edit-history-tab'));
    });
    it('should trigger addBlueSquare when admin click on + button', async () => {
      userEvent.click(screen.getByText('+'));
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });
    it('should trigger addBlueSquare when admin click on random blue square', async () => {
      userEvent.click(screen.getAllByRole('button')[2]);
      expect(screen.getByText('Summary')).toBeInTheDocument();
    });
    it('should change value while user typing in first name field', async () => {
      const firstName = screen.getByPlaceholderText(/first name/i);
      userEvent.clear(firstName);
      userEvent.type(firstName, 'testFirstName');
      expect(firstName).toHaveValue('testFirstName');
    });
    it('should change value while user typing in last name field', async () => {
      const lastName = screen.getByPlaceholderText(/last name/i);
      userEvent.clear(lastName);
      userEvent.type(lastName, 'testLastName');
      expect(lastName).toHaveValue('testLastName');
    });
    it('should change value while user typing in email field', async () => {
      const email = screen.getByPlaceholderText(/email/i);
      userEvent.clear(email);
      userEvent.type(email, 'testaccount@hgn.com');
      expect(email).toHaveValue('testaccount@hgn.com');
    });
    it('should change value while user typing in phone field', async () => {
      const phoneNumber = screen.getByPlaceholderText(/phone/i);
      userEvent.clear(phoneNumber);
      userEvent.type(phoneNumber, '5465468798');
      expect(phoneNumber).toHaveValue(5465468798);
    });
    it('should change value while user click on phone switch', async () => {
      const phoneSwitch = screen.getByTestId('phone-switch');
      userEvent.click(phoneSwitch);
      expect(phoneSwitch).toBeChecked();
    });
    it('should change value while user click on email switch', async () => {
      const emailSwitch = screen.getByTestId('email-switch');
      userEvent.click(emailSwitch);
      expect(emailSwitch).toBeChecked();
    });
    it('should change value while user click on bluesquare switch', async () => {
      const blueSwitch = screen.getByTestId('blue-switch');
      userEvent.click(blueSwitch);
      expect(blueSwitch).toBeChecked();
    });
    it('should change value while user typing in Video Call Preference', async () => {
      const preference = screen.getByPlaceholderText(/Skype, Zoom, etc./i);
      userEvent.clear(preference);
      userEvent.type(preference, 'Zoom');
      expect(preference).toHaveValue('Zoom');
    });
    it('should change value while user typing in weekly committed field', async () => {
      const weekCommittedHour = screen.getByPlaceholderText(/weeklyCommittedHours/i);
      fireEvent.change(weekCommittedHour, { target: { value: '20' } });
      expect(weekCommittedHour).toHaveValue(20);
    });
    it('should change value while user typing in total committed field', async () => {
      const weekCommittedHour = screen.getByPlaceholderText(/totalCommittedHours/i);
      fireEvent.change(weekCommittedHour, { target: { value: '40' } });
      expect(weekCommittedHour).toHaveValue(40);
    });
    // it('should popup a modal once the user clicks the blue + button', () => {
    //   userEvent.click(screen.getByText('+'));
    //   expect(screen.getByRole('dialog')).toBeInTheDocument();
    // });
    // it('should change value once the user clicks the switches', () => {
    //   const checkboxes = screen.getAllByRole('checkbox');
    //   checkboxes.forEach((box) => {
    //     userEvent.click(box);
    //     expect(box).toBeChecked();
    //   });
    // });
    // it('should popup a modal once the user clicks the manage links button', () => {
    //   userEvent.click(screen.getByTestId(/edit-link/i));
    //   expect(screen.getByRole('dialog'));
    // });
    // it('should fire updateProfile once the user clicks save changes', () => {
    //   // actions.updateUserProfile = jest.fn().mockResolvedValue(200);
    //   actions.updateUserProfile.mockResolvedValue(200);
    //   userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    //   expect(actions.updateUserProfile).toHaveBeenCalled();
    // });
    // it('should go back to user profile view mode', () => {
    //   const { location } = window;
    //   delete window.location;
    //   userEvent.click(screen.getByRole('link', { name: /cancel/i }));
    // });
    // it('should popup an error when the first name is left blank', () => {
    //   const input = screen.getByPlaceholderText(/last name/i);
    //   fireEvent.change(input, { target: { value: '' } });
    //   expect(screen.getByText(/first name can't be null/i)).toBeInTheDocument();
    // });
    // it('should popup an error when the last name is left blank', () => {
    //   fireEvent.change(screen.getByPlaceholderText(/last name/i), { target: { value: '' } });
    //   expect(screen.getByText(/last name can't be null/i)).toBeInTheDocument();
    // });
    // it('should popup an modal after the user clicks on any bluesquare', () => {
    //   userEvent.click(screen.getAllByRole('button', { name: /\d\d\d\d-\d\d-\d\d/i })[0]);
    //   expect(screen.getByRole('dialog')).toBeInTheDocument();
    // });
    // it('should fire change blusqaure information after the update the bluesquare with the modal', () => {
    //   userEvent.click(screen.getAllByRole('button', { name: /\d\d\d\d-\d\d-\d\d/i })[0]);
    //   fireEvent.change(screen.getAllByRole('textbox')[3], { target: { value: 'uniqueTest' } });
    //   userEvent.click(screen.getByRole('button', { name: /update/i }));
    //   expect(screen.getByText(/uniquetest/i)).toBeInTheDocument();
    // });
  });
});
