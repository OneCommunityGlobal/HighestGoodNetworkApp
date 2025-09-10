// import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import { configureStore } from 'redux-mock-store';
import UserSearchPanel from '../UserSearchPanel';
import { renderWithProvider } from '../../../__tests__/utils';
// import { overrides } from 'chart.js/dist/core/core.defaults';

const mockStore = configureStore([thunk]);
const nonJaeAccountMock = {
  _id: '5edf141c78f1380017b829a6',
  isAdmin: true,
  user: {
    expiryTimestamp: '2023-08-22T22:51:06.544Z',
    iat: 1597272666,
    userid: '5edf141c78f1380017b829a6',
    role: 'Administrator',
    email: 'non_jae@hgn.net',
  },
  firstName: 'Non',
  lastName: 'Petterson',
  role: 'Administrator',
  weeklycommittedHours: 10,
  email: 'non_jae@hgn.net',
};

const ownerAccountMock = {
  _id: '5edf141c78f1380017b829a6',
  isAdmin: true,
  user: {
    expiryTimestamp: '2023-08-22T22:51:06.544Z',
    iat: 1597272666,
    userid: '5edf141c78f1380017b829a6',
    role: 'Owner',
    email: 'devadmin@hgn.net',
  },
  firstName: 'Dev',
  lastName: 'Admin',
  weeklycommittedHours: 10,
  email: 'devadmin@hgn.net',
};

describe('user search panel', () => {
  let onNewUserClick;
  let onSearch;
  let onActiveFilter;
  let store;
  const renderPanel = () => {
     renderWithProvider(
      <UserSearchPanel
        onSearch={onSearch}
        onActiveFiter={onActiveFilter}
        onNewUserClick={onNewUserClick}
      />,
      { store },
    );
  }
  beforeEach(() => {
    store = mockStore({
      auth: ownerAccountMock,
      userProfile: nonJaeAccountMock,
      role: nonJaeAccountMock.role,
    });
    onNewUserClick = vi.fn();
    onSearch = vi.fn();
    onActiveFilter = vi.fn();
  });

  describe('Structure', () => {
    // it('should render one `create new user` button', () => {
    //   expect(screen.getByRole('button', { name: /create new user/i })).toBeInTheDocument();
    // });
    it('should render one textbox', () => {
      renderPanel();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
    it('should render one combo box for selection', () => {
      renderPanel();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });
  describe('Behavior', () => {
    // it('should call onNewUserClick() when the user clicks `create new user` button', () => {
    //   userEvent.click(screen.getByRole('button', { name: /create new user/i }));
    //   expect(onNewUserClick).toHaveBeenCalled();
    // });
    it('should call onSearch each time the user types one letter', async() => {
      renderPanel();
      await userEvent.type(screen.getByRole('textbox'), 'test', { allAtOnce: false });
      expect(onSearch).toHaveBeenCalledTimes(4);
    });
    it('should change value when user types something', async() => {
      renderPanel();
      await userEvent.type(screen.getByRole('textbox'), 'test', { allAtOnce: false });
      expect(screen.getByRole('textbox')).toHaveValue('test');
    });
    it('should change value when user select different option on the combobox', async() => {
      renderPanel();
      await userEvent.selectOptions(screen.getByRole('combobox'), 'active');
      expect(screen.getByRole('combobox')).toHaveValue('active');
      await userEvent.selectOptions(screen.getByRole('combobox'), 'inactive');
      expect(screen.getByRole('combobox')).toHaveValue('inactive');
    });
    it('should fire onActiveFilter() once the user change the value on combobox', async() => {
      renderPanel();
      await userEvent.selectOptions(screen.getByRole('combobox'), 'active');
      expect(onActiveFilter).toHaveBeenCalled();
      await userEvent.selectOptions(screen.getByRole('combobox'), 'inactive');
      expect(onActiveFilter).toHaveBeenCalledTimes(2);
    });
  });
  describe('More Behaviors', () => {
    it('should not call onSearch when no user input', async () => {
      renderPanel();
      await userEvent.type(screen.getByRole('textbox'), '');
      expect(onSearch).toHaveBeenCalledTimes(0);
    });
    it('should change value when user types something', async () => {
      renderPanel();
      await userEvent.type(screen.getByRole('textbox'), 'test all at once', { allAtOnce: true });
      expect(screen.getByRole('textbox')).toHaveValue('test all at once');
    });
    it('should change value when user select different option on the combobox', async() => {
      renderPanel();
      await userEvent.selectOptions(screen.getByRole('combobox'), 'paused');
      expect(screen.getByRole('combobox')).toHaveValue('paused');
      await userEvent.selectOptions(screen.getByRole('combobox'), 'all');
      expect(screen.getByRole('combobox')).toHaveValue('all');
    });
    it('should fire onActiveFilter() once the user change the value on combobox', async() => {
      renderPanel();
      await userEvent.selectOptions(screen.getByRole('combobox'), 'paused');
      expect(onActiveFilter).toHaveBeenCalled();
      await userEvent.selectOptions(screen.getByRole('combobox'), 'all');
      expect(onActiveFilter).toHaveBeenCalledTimes(2);
    });
  });
});
