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

import Userprofile from '../../components/UserProfile/UserProfile.container';
import * as actions from '../../actions/userProfile';

jest.mock('../../actions/allTeamsAction.js');
jest.mock('../../actions/userProfile.js');
jest.mock('../../actions/team.js');
jest.mock('../../actions/projects.js');


const mockStore = configureMockStore([thunk]);
describe('User profile page', () => {
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
    });
    store.dispatch = jest.fn();
    renderWithRouterMatch(
      <Route path="/userprofile/:userId">
        {props => <Userprofile {...props} />}
      </Route>,
      {
        route: `/userprofile/${userId}`,
        store,
      },
    );
  });
  describe('Structure', () => {
    it('should render a image', () => {
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
    it('should render the user`s name', () => {
      expect(screen.getByRole('heading', { name: `${userProfileMock.firstName} ${userProfileMock.lastName}` }));
    });
    it('should render the user`s job title', () => {
      expect(screen.getByRole('heading', { name: `${userProfileMock.jobTitle}` }));
    });
    it('should render an assign team button', () => {
      expect(screen.getByRole('button', { name: /assign team/i })).toBeInTheDocument();
    });
    it('should render delete buttons', () => {
      expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(userProfileMock.teams.length + userProfileMock.projects.length);
    });

    it('should render multiple links', () => {
      expect(screen.getAllByRole('link')).toHaveLength(userProfileMock.personalLinks.length + userProfileMock.adminLinks.length + 2);
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
    it('should render `Basic Information` Tab', () => {
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
    });
    it('should render `Volunteering Times` Tab', () => {
      expect(screen.getByText('Volunteering Times')).toBeInTheDocument();
    });
    it('should runder Teams tab', () => {
      expect(screen.getAllByText('Teams')).toHaveLength(2);
    });
    it('should render Projects tab', () => {
      expect(screen.getAllByText('Projects')).toHaveLength(2);
    });
    it('should render a basic info tab', () => {
      expect(screen.getByTestId('basic-info-tab')).toBeInTheDocument();
    });
    it('should render a time tab', () => {
      expect(screen.getByTestId('volunteering-time-tab')).toBeInTheDocument();
    });
    it('should render a links field', () => {
      expect(screen.getByTestId('user-link')).toBeInTheDocument();
    });
    it('should render a bluesquare field', () => {
      expect(screen.getByTestId('blueSqaure-field')).toBeInTheDocument();
    });
    it('should render a `save changes` button', () => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });
    it('should render a update password button', () => {
      expect(screen.getByRole('button', { name: /update password/i }));
    });
  });

  describe('behavior', () => {
    it('should fire UpdateUserProfile action once the user clicks the save changes button', async () => {
      await userEvent.type(screen.getByPlaceholderText(/first name/i), 'test', { allAtOnce: false });
      userEvent.click(screen.getByRole('button', { name: /save change/i }));
      expect(actions.updateUserProfile).toHaveBeenCalled();
    });
  });
});
