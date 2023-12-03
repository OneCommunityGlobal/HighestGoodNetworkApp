import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPasswordPopup from '../ResetPasswordPopup';

const invalidPasswordError =
  'Please choose a strong password which is at least 8 characters long and should contains a digit , a capital letter and a special character.';
describe('reset password popup', () => {
  const onClose = jest.fn();
  const onReset = jest.fn();
  beforeEach(() => {
    render(<ResetPasswordPopup open onReset={onReset} onClose={onClose} />);
  });
  describe('Structure', () => {
    it('should render two password input field', () => {
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });
    it('should render one confirm button', () => {
      expect(screen.getByRole('button', { name: /reset password/i }));
    });
    it('should render two close buttons', () => {
      expect(screen.getAllByRole('button', { name: /close/i })).toHaveLength(2);
    });
  });
  describe('Behavior', () => {
    it('should change value while the user type in the textbox ', async () => {
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'test', {
        allAtOnce: false,
      });
      expect(screen.getByLabelText(/confirm password/i)).toHaveValue('test');
      await userEvent.type(screen.getByLabelText(/new password/i), 'test', { allAtOnce: false });
      expect(screen.getByLabelText(/new password/i)).toHaveValue('test');
    });
    it('should fire onClose() once the user clicks the close buttons', () => {
      screen
        .getAllByRole('button', { name: /close/i })
        .forEach((button) => userEvent.click(button));
      expect(onClose).toHaveBeenCalledTimes(2);
    });
    it('should popup error when the password does not meet the requirement', async () => {
      await userEvent.type(screen.getByLabelText(/new password/i), 'AB@12345!', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'AB@12345!', {
        allAtOnce: false,
      });
      userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(screen.getByText(invalidPasswordError)).toBeInTheDocument();
    });
    it('should popup error when the password is left blank', async () => {
      userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(screen.getByText(invalidPasswordError)).toBeInTheDocument();
    });

    it('should fire onReset() once the user clicks reset button', async () => {
      await userEvent.type(screen.getByLabelText(/new password/i), 'ABc@12345!', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'ABc@12345!', {
        allAtOnce: false,
      });
      userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });
});
