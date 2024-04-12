import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserSearchPanel from '../UserSearchPanel';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { renderWithProvider } from '../../../__tests__/utils';
const mockStore = configureStore([thunk]);
const nonJaeAccountMock = {
  _id: '5edf141c78f1380017b829a6',
  isAdmin: true,
  user: {
    expiryTimestamp: '2023-08-22T22:51:06.544Z',
    iat: 1597272666,
    userid: '5edf141c78f1380017b829a6',
    role: 'Volunteer',
    email: 'non_jae@hgn.net',
    permissions:["getUserProfiles"]
  },
  firstName: 'Non',
  lastName: 'Petterson',
  role: {
    roles:[]
  },
  weeklycommittedHours: 10,
  email: 'non_jae@hgn.net'
}

const ownerAccountMock = {
  _id: '5edf141c78f1380017b829a6',
  isAdmin: true,
  user: {
    expiryTimestamp: '2023-08-22T22:51:06.544Z',
    iat: 1597272666,
    userid: '5edf141c78f1380017b829a6',
    role: 'Owner',
    email: 'devadmin@hgn.net'
  },
  firstName: 'Dev',
  lastName: 'Admin',
  weeklycommittedHours: 10,
  email: 'devadmin@hgn.net',
  role: {
    roles:[]
  }
}

describe('user search panel not admin', () => {
  let onNewUserClick;
  let onSearch;
  let onActiveFilter;
  let store;
  beforeEach(() => {
    store = mockStore({
      auth: nonJaeAccountMock,
      userProfile: nonJaeAccountMock,
      role: nonJaeAccountMock.role
    });
    onNewUserClick = jest.fn();
    onSearch = jest.fn();
    onActiveFilter = jest.fn();
    renderWithProvider(
      <UserSearchPanel
        onSearch={onSearch}
        onActiveFiter={onActiveFilter}
        onNewUserClick={onNewUserClick}
      />, { store, }
    );
  });

  describe('Structure', () => {
    it('should render one Disable `create new user` button', () => {
      expect(screen.getByRole('button', { name: /create new user/i })).toBeDisabled();
    });
    it('should render one textbox', () => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
    it('should render one combo box for selection', () => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });
  describe('Behavior', () => {
    // it('should call onNewUserClick() when the user clicks `create new user` button', () => {
    //   userEvent.click(screen.getByRole('button', { name: /create new user/i }));
    //   expect(onNewUserClick).toHaveBeenCalled();
    // });
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
