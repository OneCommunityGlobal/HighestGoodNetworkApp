import React from 'react';
import { Route } from 'react-router-dom';
import {
  screen, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  authMock, userProfileMock, timeEntryMock, userProjectMock, allProjectsMock, allTeamsMock,
} from '../mockStates';
import { renderWithRouterMatch } from '../utils';
import UserProfile from '../../components/UserProfile/UserProfile.container';
import * as actions from '../../actions/userProfile';

jest.mock('../../actions/allTeamsAction.js');
jest.mock('../../actions/userProfile.js');
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
      //   authMock, userProfileMock, timeEntryMock, userProjectMock, allProjectsMock, allTeamsMock,
      // },
    });
    store.dispatch = jest.fn();
    renderWithRouterMatch(

      <Route path="/userprofile/:userId">
        {props => <UserProfile {...props} />}
      </Route>,
      {
        route: `/userprofile/${userId}`,
        store,
      },
    );
  });
  describe('Sturecture', () => {
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
      expect(screen.getAllByRole('button', { name: /\d\d\d\d-\d\d-\d\d/i })).toHaveLength(userProfileMock.infringments.length);
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
      expect(screen.getByPlaceholderText(/phone/i)).toHaveValue(parseInt(userProfileMock.phoneNumber, 10));
    });
    it('should render a Weekly commited hours field for admin', () => {
      expect(screen.getByPlaceholderText(/weeklycomittedhours/i)).toBeInTheDocument();
    });
    it('should render a total hours field for admin', () => {
      expect(screen.getByPlaceholderText(/totalcomittedhours/i)).toBeInTheDocument();
    });
    it('should render an assign team button', () => {
      expect(screen.getByRole('button', { name: /assign team/i })).toBeInTheDocument();
    });
    it('should render delete buttons', () => {
      expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(userProfileMock.teams.length + userProfileMock.projects.length);
    });
    it('should render `Basic Information` Tab', () => {
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
    });
    it('should render `Volunteering Times` Tab', () => {
      expect(screen.getByText('Volunteering Times')).toBeInTheDocument();
    });
    it('should runder Teams tab', () => {
      expect(screen.getByText('Teams')).toBeInTheDocument();
    });
    it('should render Projects tab', () => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
    it('should render multiple links', () => {
      expect(screen.getAllByRole('link')).toHaveLength(userProfileMock.personalLinks.length + userProfileMock.adminLinks.length + 1);
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
    it('should change value while user typing in first name field', async () => {
      const input = screen.getByPlaceholderText(/first name/i);
      await userEvent.type(input, 'test', { allAtOnce: false });
      expect(input).toHaveValue(`${userProfileMock.firstName}test`);
      expect(screen.getByText(/reminder:.*/i)).toBeInTheDocument();
    });
    // it('should change value while user typing in last name field', async () => {
    //   const input = screen.getByPlaceholderText(/last name/i);
    //   await userEvent.type(input, 'test', { allAtOnce: false });
    //   expect(input).toHaveValue(`${userProfileMock.lastName}test`);
    // });
    // it('should change value while user typing in the email field', async () => {
    //   const input = screen.getByPlaceholderText(/email/i);
    //   await userEvent.type(input, 'test', { allAtOnce: false });
    //   expect(input).toHaveValue(`${userProfileMock.email}test`);
    // });
    // it('should change value while user typing in the phone number field', async () => {
    //   const input = screen.getByPlaceholderText('Phone');
    //   await userEvent.type(input, '111', { allAtOnce: false });
    //   expect(input).toHaveValue(parseInt(`${userProfileMock.phoneNumber}111`, 10));
    // });
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
