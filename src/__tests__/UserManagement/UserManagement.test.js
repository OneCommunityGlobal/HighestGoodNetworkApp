import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { allUserProfilesMock, allProjectsMock } from '../mockStates';
import { renderWithProvider, renderWithRouterMatch } from '../utils';
import UserManagement from '../../components/UserManagement/UserManagement';
import * as actions from '../../actions/userManagement';


const mockStore = configureMockStore([thunk]);

jest.mock('../../actions/userManagement.js');
jest.mock('../../actions/projects.js');

describe('user management', () => {
  let store;
  const userID = '5f31dcb9a1a909eadee0eecb';
  beforeEach(() => {
    store = mockStore({
      allUserProfiles: allUserProfilesMock,
      allProjects: allProjectsMock,
    });
    store.dispatch = jest.fn();
    renderWithProvider(
      <UserManagement />,
      {
        store,
      },
    );
  });
  describe('structure', () => {
    it('should render the page without crashing', () => {
    });
    it('should render 10 lines of user data row plus 1 line of header and 1 line of search box', () => {
      expect(screen.getAllByRole('row')).toHaveLength(10 + 2);
    });
    it('should render one create new user button', () => {
      expect(screen.getByRole('button', { name: /create new user/i })).toBeInTheDocument();
    });
    it('should render one search box', () => {
      expect(screen.getByPlaceholderText(/search text/i)).toBeInTheDocument();
    });
    it('should render the footer', () => {
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    });
  });
  describe('behavior', () => {
    it('should show 25 + 2 lines of data if the user select `25` in the page size', () => {
      userEvent.selectOptions(screen.getByDisplayValue('10'), '25');
      expect(screen.getAllByRole('row')).toHaveLength(25 + 2);
    });
    it('should change to page 2 if the user clicks the button `2`', () => {
      expect(screen.queryByText('Dipti')).toBeFalsy();
      userEvent.click(screen.getByRole('button', { name: /2/i }));
      expect(screen.getByText('Dipti')).toBeInTheDocument();
    });
    it('should change to page 2 if the user clicks the button `next`', () => {
      expect(screen.queryByText('Dipti')).toBeFalsy();
      userEvent.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText('Dipti')).toBeInTheDocument();
    });
    it('should filter the first name once the user types somthing in the first name search box', async () => {
      expect(screen.getAllByText('Test')).toBeTruthy();
      await userEvent.type(screen.getAllByRole('textbox')[1], 'nit', { allAtOnce: false });
      expect(screen.queryByText('Test')).toBeFalsy();
    });
    it('should filter the last name once the user types somthing in the last name search box', async () => {
      expect(screen.getAllByText('Test')).toBeTruthy();
      await userEvent.type(screen.getAllByRole('textbox')[2], 'Administrator', { allAtOnce: false });
      expect(screen.queryByText('Test')).toBeFalsy();
    });
    it('should fileter the role once the user select a role in the role search box', () => {
      expect(screen.getAllByText('Administrator')).not.toHaveLength(1);
      userEvent.selectOptions(screen.getAllByRole('combobox')[1], 'Volunteer');
      expect(screen.getAllByText('Administrator')).toHaveLength(1);
    });
    it('should filter the email once the user types something in the email search box', async () => {
      expect(screen.getAllByText('onecommunityglobal@gmail.com')).not.toHaveLength(0);
      await userEvent.type(screen.getAllByRole('textbox')[3], 'nithuan141', { allAtOnce: false });
      expect(screen.queryByText('onecommunityglobal@gmail.com')).toBeFalsy();
    });
    it('should filter weekly commited hrs once the user tries to search it', async () => {
      expect(screen.getAllByText('0')).toBeTruthy();
      await userEvent.type(screen.getAllByRole('textbox')[4], '15', { allAtOnce: false });
      expect(screen.queryByText('0')).toBeFalsy();
    });
    it('should fire the deleteUSer action when the user wants to delete a user', () => {
      userEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      userEvent.click(screen.getByRole('button', { name: /understood, .*/i }));
      expect(actions.deleteUser).toHaveBeenCalled();
    });
    it('should fire the updateUserStatus when the user wants to set a user inactive', () => {
      userEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      userEvent.click(screen.getByRole('button', { name: /oops,.*/i }));
      expect(actions.updateUserStatus).toHaveBeenCalled();
    });
    it('should popup a modal once the user clicks the `create new user` button', () => {
      userEvent.click(screen.getByRole('button', { name: /create new user/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('should close the modal once the user clicks `close`', () => {
      userEvent.click(screen.getByRole('button', { name: /create new user/i }));
      userEvent.click(screen.getAllByRole('button', { name: /close/i })[1]);
      // expect(screen.getByRole('dialog')).not.toBeInTheDocument();
    });
    it('should filter active/inactive once the user select the filter', () => {
      userEvent.selectOptions(screen.getByDisplayValue('All'), 'active');
      expect(screen.getAllByTitle('Click here to change the user status')[0]).not.toHaveClass('inactive');
    });
    it('should filter pause once the user select the filter', () => {
      userEvent.selectOptions(screen.getByDisplayValue('All'), 'paused');
      expect(screen.queryByRole('button', { name: /pause/i })).toBeFalsy();
    });
    it('should perform wildcard search while the user typing in the search box', async () => {
      await userEvent.type(screen.getByPlaceholderText(/Search Text/i), 'gmail.com', { allAtOnce: false });
      expect(screen.queryByText(/.*hgn.net.*/)).toBeFalsy();
    });
  });
});
