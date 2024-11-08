import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserTableSearchHeader from '../UserTableSearchHeader';
describe('user table search header row', () => {
  let onFirstNameSearch;
  let onLastNameSearch;
  let onRoleSearch;
  let onEmailSearch;
  let onWeeklyHrsSearch;
  beforeEach(() => {
    onFirstNameSearch = jest.fn();
    onLastNameSearch = jest.fn();
    onRoleSearch = jest.fn();
    onEmailSearch = jest.fn();
    onWeeklyHrsSearch = jest.fn();
    render(
      <table>
        <tbody>
          <UserTableSearchHeader
            onFirstNameSearch={onFirstNameSearch}
            onLastNameSearch={onLastNameSearch}
            onRoleSearch={onRoleSearch}
            onEmailSearch={onEmailSearch}
            onWeeklyHrsSearch={onWeeklyHrsSearch}
            roles={['1', '2', '3', '4','Volunteer','Owner','Manager']}
          />
        </tbody>
      </table>,
    );
  });
  describe('Structure', () => {
    it('should render a row', () => {
      expect(screen.getByRole('row')).toBeInTheDocument();
    });
    it('should render 4 text field', () => {
      expect(screen.getAllByRole('textbox')).toHaveLength(4);
    });
    it('should render one dropdown box', () => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });
  describe('Behavior', () => {
    it('should fire onFirstNameSearch once the user type something in the first name search box', async () => {
      await userEvent.type(screen.getAllByRole('textbox')[0], 'test', { allAtOnce: false });
      expect(onFirstNameSearch).toHaveBeenCalledTimes(4);
    });
    it('should fire onLastNameSearch once the user tyep something the last name search box', async () => {
      await userEvent.type(screen.getAllByRole('textbox')[1], 'test', { allAtOnce: false });
      expect(onLastNameSearch).toHaveBeenCalledTimes(4);
    });
    it('should fire onRoleSearch once the user select some thing in the dropdown search box', () => {
      userEvent.selectOptions(screen.getByRole('combobox'), '2');
      expect(onRoleSearch).toHaveBeenCalled();
      expect(onRoleSearch).toHaveBeenCalledWith('2');
    });
    it('should fire onRoleSearch once the user select some thing in the dropdown search box', () => {
      userEvent.selectOptions(screen.getByRole('combobox'), 'Volunteer');
      expect(onRoleSearch).toHaveBeenCalled();
      expect(onRoleSearch).toHaveBeenCalledWith('Volunteer');
    });
    it('should fire onRoleSearch once the user select some thing in the dropdown search box', () => {
      userEvent.selectOptions(screen.getByRole('combobox'), 'Owner');
      expect(onRoleSearch).toHaveBeenCalled();
      expect(onRoleSearch).toHaveBeenCalledWith('Owner');
    });
    it('should fire onRoleSearch once the user select some thing in the dropdown search box', () => {
      userEvent.selectOptions(screen.getByRole('combobox'), 'Manager');
      expect(onRoleSearch).toHaveBeenCalled();
      expect(onRoleSearch).toHaveBeenCalledWith('Manager');
    });
    it('should fire Email search once the user type something in the email search box', async () => {
      await userEvent.type(screen.getAllByRole('textbox')[2], 'test', { allAtOnce: false });
      expect(onEmailSearch).toHaveBeenCalledTimes(4);
    });
    it('should fire Email search once the user type something in the email search box', async () => {
      await userEvent.type(screen.getAllByRole('textbox')[2], 'Jhon.wick@email.com', { allAtOnce: true });
      expect(onEmailSearch).toHaveBeenCalled();
    });
    it('should fire onWeeklyHrsSearch once the user type something in the weeklycommitted hrs search box', async () => {
      await userEvent.type(screen.getAllByRole('textbox')[3], 'test', { allAtOnce: false });
      expect(onWeeklyHrsSearch).toHaveBeenCalledTimes(4);
    });
    it('should fire onWeeklyHrsSearch once the user type something in the weeklycommitted hrs search box', async () => {
      await userEvent.type(screen.getAllByRole('textbox')[3], '15', { allAtOnce: true });
      expect(onWeeklyHrsSearch).toHaveBeenCalled();
    });
  });
});
