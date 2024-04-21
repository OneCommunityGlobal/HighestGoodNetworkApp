import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserTableData from '../UserTableData';
import { authMock, userProfileMock, rolesMock } from '../../../__tests__/mockStates';
import { renderWithProvider } from '../../../__tests__/utils';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([thunk]);
const jaeAccountMock = {
  _id: '1',
  isAdmin: true,
  user: {
    expiryTimestamp: '2023-08-22T22:51:06.544Z',
    iat: 1597272666,
    userid: '1',
    role: 'Administrator',
    email: 'devadmin@hgn.net'
  },
  firstName: 'Is',
  lastName: 'Jae',
  role: 'Administrator',
  email: 'devadmin@hgn.net',
  weeklycommittedHours: 10,
}
const nonJaeAccountMock = {
  _id: '2',
  isAdmin: true,
  user: {
    expiryTimestamp: '2023-08-22T22:51:06.544Z',
    iat: 1597272666,
    userid: '2',
    role: 'Administrator',
    email: 'non_jae@hgn.net'
  },
  firstName: 'Non',
  lastName: 'Petterson',
  role: 'Administrator',
  weeklycommittedHours: 10,
  email: 'non_jae@hgn.net'
}

const ownerAccountMock = {
  _id: '3',
  isAdmin: true,
  user: {
    expiryTimestamp: '2023-08-22T22:51:06.544Z',
    iat: 1597272666,
    userid: '3',
    role: 'Owner',
    email: 'devadmin@hgn.net'
  },
  firstName: 'Dev',
  lastName: 'Admin',
  weeklycommittedHours: 10,
  email: 'devadmin@hgn.net'
}


describe('User Table Data: Non-Jae related Account', () => {
  let onPauseResumeClick;
  let onDeleteClick;
  let onActiveInactiveClick;
  let store;
  beforeEach(() => {
    store = mockStore({
      auth: ownerAccountMock,
      userProfile: nonJaeAccountMock,
      role: nonJaeAccountMock.role
    });
    onPauseResumeClick = jest.fn();
    onDeleteClick = jest.fn();
    onActiveInactiveClick = jest.fn();
    renderWithProvider(
      <table>
        <tbody>
          <UserTableData
            isActive
            index={0}
            user={nonJaeAccountMock}
            onActiveInactiveClick={onActiveInactiveClick}
            onPauseResumeClick={onPauseResumeClick}
            onDeleteClick={onDeleteClick}
          />
        </tbody>
      </table>,
      { store, }
    );
  });
  describe('Structure', () => {
    it('should render one row of data', () => {
      expect(screen.getByRole('row')).toBeInTheDocument();
    });
    it('should render a active/inactive button', () => {
      expect(screen.getByTitle('Click here to change the user status')).toBeInTheDocument();
    });

    it('should render the first name and last name as links', () => {
      expect(screen.getByRole('link', { name: nonJaeAccountMock.firstName })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: nonJaeAccountMock.lastName })).toBeInTheDocument();
    });
    it('should render the correct role', () => {
      expect(screen.getByText(nonJaeAccountMock.role)).toBeInTheDocument();
    });
    it('should render the correct email', () => {
      expect(screen.getByText(nonJaeAccountMock.email)).toBeInTheDocument();
    });
    it('should render the correct weekly committed hrs', () => {
      expect(screen.getByText(`${nonJaeAccountMock.weeklycommittedHours}`)).toBeInTheDocument();
    });
    it('should render a `Pause` button', () => {
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });
    it('should render a `Delete` button', () => {
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
    it('should render a `reset password` button', () => {
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });
  describe('Behavior', () => {
    it('should redirect to user profile once the user name has been clicked', () => {
      expect(screen.getByRole('link', { name: nonJaeAccountMock.firstName })).toHaveAttribute(
        'href',
        `/userprofile/${nonJaeAccountMock._id}`,
      );
      expect(screen.getByRole('link', { name: nonJaeAccountMock.lastName })).toHaveAttribute(
        'href',
        `/userprofile/${nonJaeAccountMock._id}`,
      );
    });
    it('should fire onDeleteClick() once the user clicks the delete button', () => {
      userEvent.click(screen.getByRole('button', { name: /delete/i }));
      expect(onDeleteClick).toHaveBeenCalledTimes(1);
    });
    it('should fire onPauseClick() once the user clicks the pause button', () => {
      userEvent.click(screen.getByRole('button', { name: /pause/i }));
      expect(onPauseResumeClick).toHaveBeenCalledTimes(1);
    });
    it('should fire onActiveInactiveClick() once the user clicks the active/inactive button', () => {
      userEvent.click(screen.getByTitle('Click here to change the user status'));
      expect(onActiveInactiveClick).toHaveBeenCalledTimes(1);
    });
    it('should render a modal once the user clicks the `reset password` button', () => {
      userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});


describe('User Table Data: Jae protected account record and login as Jae related account', () => {
  let onPauseResumeClick;
  let onDeleteClick;
  let onActiveInactiveClick;
  let store;
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProfile: jaeAccountMock,
      role: jaeAccountMock.role
    });
    onPauseResumeClick = jest.fn();
    onDeleteClick = jest.fn();
    onActiveInactiveClick = jest.fn();
    renderWithProvider(
      <table>
        <tbody>
          <UserTableData
            isActive
            index={0}
            user={jaeAccountMock}
            onActiveInactiveClick={onActiveInactiveClick}
            onPauseResumeClick={onPauseResumeClick}
            onDeleteClick={onDeleteClick}
          />
        </tbody>
      </table>,
      { store, }
    );
  });
  describe('Structure', () => {
    it('should render one row of data', () => {
      expect(screen.getByRole('row')).toBeInTheDocument();
    });
    it('should render a active/inactive button', () => {
      expect(screen.getByTitle('Click here to change the user status')).toBeInTheDocument();
    });

    it('should render the first name and last name as links', () => {
      expect(screen.getByRole('link', { name: jaeAccountMock.firstName })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: jaeAccountMock.lastName })).toBeInTheDocument();
    });
    it('should render the correct role', () => {
      expect(screen.getByText(jaeAccountMock.role)).toBeInTheDocument();
    });
    it('should render the correct email', () => {
      expect(screen.getByText(jaeAccountMock.email)).toBeInTheDocument();
    });
    it('should render the correct weekly committed hrs', () => {
      expect(screen.getByText(`${jaeAccountMock.weeklycommittedHours}`)).toBeInTheDocument();
    });
    it('should render a `Pause` button', () => {
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });
    it('should render a `Set Final Date` button', () => {
      expect(screen.getByRole('button', { name: /Set Final Day/i })).toBeInTheDocument();
    });
    it('should NOT render a `Delete` button', () => {
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });
    it('should NOT render a `reset password` button', () => {
      expect(screen.queryByRole('button', { name: /reset password/i })).not.toBeInTheDocument();
    });
  });
  describe('Behavior', () => {
    it('should redirect to user profile once the user name has been clicked', () => {
      expect(screen.getByRole('link', { name: jaeAccountMock.firstName })).toHaveAttribute(
        'href',
        `/userprofile/${jaeAccountMock._id}`,
      );
      expect(screen.getByRole('link', { name: jaeAccountMock.lastName })).toHaveAttribute(
        'href',
        `/userprofile/${jaeAccountMock._id}`,
      );
    });
    it('should fire alert() once the user clicks the pause button', () => {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation();
        userEvent.click(screen.getByRole('button', { name: /pause/i }))
        expect(alertMock).toHaveBeenCalledTimes(1)
     
    });
    it('should fire alert() once the user clicks the active/inactive button', () => {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation();
        userEvent.click(screen.getByRole('button', { name: /Set Final Day/i }))
        expect(alertMock).toHaveBeenCalledTimes(1)
    });
  });
});