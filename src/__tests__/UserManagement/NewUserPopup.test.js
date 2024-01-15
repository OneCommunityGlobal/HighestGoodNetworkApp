import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { renderWithProvider } from '../utils';
import thunk from 'redux-thunk';
import NewUserPopup from '../../components/UserManagement/NewUserPopup';

jest.mock('../../components/UserProfile/AddNewUserProfile', () => {
  const userprofile = () => (
    <div>
      <h4>User Profile</h4>
    </div>
  );
  return userprofile;
});
const mockStore = configureStore([thunk]);

describe('new user popup', () => {
  const onUserPopupClose = jest.fn();
  let store;
  beforeEach(() => {
    store = mockStore({
      userProfile: {
        role: 'userRole', // Provide the role here in the initial state
      },
    });
    renderWithProvider(<NewUserPopup open onUserPopupClose={onUserPopupClose} />, { store });
  });
  describe('Structure', () => {
    it('should render the modal', () => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('should render User Profile', () => {
      expect(screen.getByRole('heading', { name: /user profile/i })).toBeInTheDocument();
    });
    it('should render two close buttons', () => {
      expect(screen.getAllByRole('button', { name: /close/i })).toHaveLength(2);
    });
    it('should render create new user heading', () => {
      expect(screen.getByText('Create New User')).toBeInTheDocument();
    });
  });
  describe('behavior', () => {
    it('should fire onUserPopupClose() when the user clicks close buttons', () => {
      screen.getAllByRole('button', { name: /close/i }).forEach((close) => {
        userEvent.click(close);
      });
      expect(onUserPopupClose).toHaveBeenCalledTimes(2);
    });
  });
});

describe('new user popup close test', () => {
  const onUserPopupClose = jest.fn();
  let store;
  it('should not render new user popup when closed', () => {
  store = mockStore({
    userProfile: {
      role: 'userRole', // Provide the role here in the initial state
    },
  });
  const {testid} = renderWithProvider(<NewUserPopup close onUserPopupClose={onUserPopupClose} />, { store });
  expect(testid).toBeFalsy();
  });
});
