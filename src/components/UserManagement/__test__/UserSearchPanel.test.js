import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserSearchPanel from '../UserSearchPanel';

describe('user search panel', () => {
  let onNewUserClick;
  let onSearch;
  let onActiveFilter;
  beforeEach(() => {
    onNewUserClick = jest.fn();
    onSearch = jest.fn();
    onActiveFilter = jest.fn();
    render(
      <UserSearchPanel
        onSearch={onSearch}
        onActiveFiter={onActiveFilter}
        onNewUserClick={onNewUserClick}
      />,
    );
  });

  describe('Structure', () => {
    it('should render one `create new user` button', () => {
      expect(screen.getByRole('button', { name: /create new user/i })).toBeInTheDocument();
    });
    it('should render one textbox', () => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
    it('should render one combo box for selection', () => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });
  describe('Behavior', () => {
    it('should call onNewUserClick() when the user clicks `create new user` button', () => {
      userEvent.click(screen.getByRole('button', { name: /create new user/i }));
      expect(onNewUserClick).toHaveBeenCalled();
    });
    it('should call onSearch each time the user types one letter', async () => {
      await userEvent.type(screen.getByRole('textbox'), 'test', { allAtOnce: false });
      expect(onSearch).toHaveBeenCalledTimes(4);
    });
    it('should change value when user types something', async () => {
      await userEvent.type(screen.getByRole('textbox'), 'test', { allAtOnce: false });
      expect(screen.getByRole('textbox')).toHaveValue('test');
    });
    it('should change value when user select different option on the combobox', () => {
      userEvent.selectOptions(screen.getByRole('combobox'), 'active');
      expect(screen.getByRole('combobox')).toHaveValue('active');
      userEvent.selectOptions(screen.getByRole('combobox'), 'inactive');
      expect(screen.getByRole('combobox')).toHaveValue('inactive');
    });
    it('should fire onActiveFilter() once the user change the value on combobox', () => {
      userEvent.selectOptions(screen.getByRole('combobox'), 'active');
      expect(onActiveFilter).toHaveBeenCalled();
      userEvent.selectOptions(screen.getByRole('combobox'), 'inactive');
      expect(onActiveFilter).toHaveBeenCalledTimes(2);
    });
  });
});
