import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewUserPopup from '../../components/UserManagement/NewUserPopup';

jest.mock('../../components/UserProfile', () => {
  const userprofile = () => <div><h4>User Profile</h4></div>;
  return userprofile;
});
describe('new user popup', () => {
  const onUserPopupClose = jest.fn();
  beforeEach(() => {
    render(<NewUserPopup
      open
      onUserPopupClose={onUserPopupClose}
    />);
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
