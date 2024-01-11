import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserTableData from '../UserTableData';
import { authMock, userProfileMock, rolesMock, dummyProfileMock } from '../../../__tests__/mockStates.js';
import { renderWithProvider } from '../../../__tests__/utils.js';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { formatDate } from '../../../utils/formatDate';

const mockStore = configureStore([thunk]);


describe('User Table Data', () => {
  let onPauseResumeClick;
  let onDeleteClick;
  let onActiveInactiveClick;
  let store;
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProfile: userProfileMock,
      role: rolesMock.role
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
            user={userProfileMock}
            onActiveInactiveClick={onActiveInactiveClick}
            onPauseResumeClick={onPauseResumeClick}
            onDeleteClick={onDeleteClick}
            userId={userProfileMock._id}
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
      expect(screen.getByRole('link', { name: userProfileMock.firstName })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: userProfileMock.lastName })).toBeInTheDocument();
    });
    it('should render the correct role', () => {
      expect(screen.getByText(userProfileMock.role)).toBeInTheDocument();
    });
    it('should render the correct email', () => {
      expect(screen.getByText(userProfileMock.email)).toBeInTheDocument();
    });
    it('should render the correct weekly committed hrs', () => {
      expect(screen.getByText(`${userProfileMock.weeklycommittedHours}`)).toBeInTheDocument();
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
      expect(screen.getByRole('link', { name: userProfileMock.firstName })).toHaveAttribute(
        'href',
        `/userprofile/${userProfileMock._id}`,
      );
      expect(screen.getByRole('link', { name: userProfileMock.lastName })).toHaveAttribute(
        'href',
        `/userprofile/${userProfileMock._id}`,
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
      if (userProfileMock.email !== "devadmin@hgn.net") {
        userEvent.click(screen.getByRole('button', { name: /reset password/i }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      }
      else {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation();
        userEvent.click(screen.getByRole('button', { name: /reset password/i }))
        expect(alertMock).toHaveBeenCalledTimes(1)
      }
    });
  });
});

describe('More User Table Data tests', () => {
  let onPauseResumeClick;
  let onDeleteClick;
  let onActiveInactiveClick;
  let store;
  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProfile: dummyProfileMock,
      role: rolesMock.role
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
            user={dummyProfileMock}
            onActiveInactiveClick={onActiveInactiveClick}
            onPauseResumeClick={onPauseResumeClick}
            onDeleteClick={onDeleteClick}
            userId={dummyProfileMock._id}
          />
        </tbody>
      </table>,
      { store, }
    );
  });
  describe('Structure', () => {
    it('should render the correct start date', () => {
      console.log(dummyProfileMock.createdDate);
      expect(screen.getByText(formatDate(dummyProfileMock.createdDate))).toBeInTheDocument();
    });
    it('should render the correct end date', () => {
      expect(screen.getByText(formatDate(dummyProfileMock.endDate))).toBeInTheDocument();
    });
    it('should render the correct pause date', () => {
      expect(screen.getByText(formatDate(dummyProfileMock.reactivationDate))).toBeInTheDocument();
    });
    it('should render the correct weekly hrs', () => {
      expect(screen.getByText(dummyProfileMock.weeklycommittedHours)).toBeInTheDocument();
    });
  });
  
});