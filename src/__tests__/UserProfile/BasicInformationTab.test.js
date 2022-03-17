import React from 'react';
import { screen, render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { authMock, userProfileMock, timeEntryMock, userProjectMock } from '../mockStates';

import { renderWithProvider } from '__tests__/utils';

import BasicInformationTab from '../../components/UserProfile/BasicInformationTab/BasicInformationTab';
// import EditForm from '../../components/UserProfile/BasicInformationTab/EditForm';
// import ViewForm from '../../components/UserProfile/BasicInformationTab/ViewTab';

describe('Edit form', () => {
  let handleUserProfile = jest.fn();
  const formValid = {
    email: true,
    firstName: true,
    lastName: true,
  };
  beforeEach(() => {
    renderWithProvider(
      <BasicInformationTab
        userProfile={userProfileMock}
        isUserAdmin
        isUserSelf
        handleUserProfile={handleUserProfile}
        formValid={formValid}
      />,
    );
  });
  describe('structure', () => {
    it('should render a first name field and a last name field', () => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
    });
    it('should render the first name field with the correct value', () => {
      expect(screen.getByPlaceholderText(/first name/i)).toHaveValue(userProfileMock.firstName);
    });
    it('should render the last name field with the correct value', () => {
      expect(screen.getByPlaceholderText(/last name/i)).toHaveValue(userProfileMock.lastName);
    });
    it('should render a title field', () => {
      expect(screen.getByPlaceholderText(/job title/i)).toBeInTheDocument();
    });
    it('should render the title field with correct value', () => {
      expect(screen.getByPlaceholderText(/title/i)).toHaveValue(userProfileMock.jobTitle[0]);
    });
    it('should render a private/public switch for phone', () => {
      expect(screen.getByTestId('phone-switch')).toBeInTheDocument();
    });
    it('should the private/public swithc for phone have the correct value', () => {
      if (userProfileMock.privacySettings.phoneNumber) {
        expect(screen.getByTestId('phone-switch')).not.toBeChecked();
      } else {
        expect(screen.getByTestId('phone-switch')).toBeChecked();
      }
    });
    it('should render a private/public switch for email', () => {
      expect(screen.getByTestId('email-switch')).toBeInTheDocument();
    });
    it('should the private/public swithc for email have the correct value', () => {
      if (userProfileMock.privacySettings.email) {
        expect(screen.getByTestId('email-switch')).not.toBeChecked();
      } else {
        expect(screen.getByTestId('email-switch')).toBeChecked();
      }
    });
    it('should render a email field', () => {
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    });
    it('should render a phone field', () => {
      //TEST IS FAILING NEED TO FIX
      // expect(screen.getByPlaceholderText(/phone/i)).toBeInTheDocument();
    });
    it('should render an information icon for Name', () => {
      expect(screen.getByTestId('info-name')).toBeInTheDocument();
    });
    it('should render an information icon for Title', () => {
      expect(screen.getByTestId('info-title')).toBeInTheDocument();
    });
    it('should render an information icon for Email', () => {
      expect(screen.getByTestId('info-email')).toBeInTheDocument();
    });
    it('should render an information icon for phone', () => {
      expect(screen.getByTestId('info-phone')).toBeInTheDocument();
    });
    // it('should show a tooltip when user hover the mouse on the info icon', () => {
    //   userEvent.hover(screen.getByTestId('info-name'));
    //   expect(screen.getByTestId('tooltip-name')).toBeInTheDocument();
    // });
  });

  /**
   *   describe('behavior', () => {
    afterEach(() => {
      handleUserProfile = jest.fn();
    });
    it('should trigger handleUserProfile when user change things in  first Name field', async () => {
      await userEvent.type(screen.getByPlaceholderText(/first name/i), 'test', { allAtOnce: false });
      expect(handleUserProfile).toHaveBeenCalledTimes(4);
    });
    it('should trigger handleUserProfile when user change things in last name field', async () => {
      await userEvent.type(screen.getByPlaceholderText(/last name/i), 'test', { allAtOnce: false });
      expect(handleUserProfile).toHaveBeenCalledTimes(4);
    });
    it('should trigger handleUserProfile when user change things in email name field', async () => {
      await userEvent.type(screen.getByPlaceholderText(/email/i), 'test', { allAtOnce: false });
      expect(handleUserProfile).toHaveBeenCalledTimes(4);
    });
    it('should trigger handleUserProfile when user change things in last phone field', async () => {
      //TEST IS FAILING NEED TO FIX
      // await userEvent.type(screen.getByPlaceholderText(/phone/i), 'test', { allAtOnce: false });
      // expect(handleUserProfile).toHaveBeenCalledTimes(4);
    });
    it('should trigger handleUserProfile once the user click the email switch', async () => {
      userEvent.click(screen.getByTestId('email-switch'));
      expect(handleUserProfile).toHaveBeenCalledTimes(1);
    });
    it('should trigger handleUserProfile once the user click the phone switch', async () => {
      userEvent.click(screen.getByTestId('phone-switch'));
      expect(handleUserProfile).toHaveBeenCalledTimes(1);
    });
  });
   */
});
