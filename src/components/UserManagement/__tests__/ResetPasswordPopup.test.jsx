// import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { themeMock } from '../../../__tests__/mockStates';
import ResetPasswordPopup from '../ResetPasswordPopup';

const mockStore = configureStore([]);
const store = mockStore({
  theme: themeMock,
});

const invalidPasswordError =
  'Please choose a strong password which is at least 8 characters long and should contains a digit , a capital letter and a special character.';
describe('reset password popup', () => {
  const onClose = vi.fn();
  const onReset = vi.fn();
  // beforeEach(() => {

  // });
  describe('Structure', () => {
    it('should render two password input field', () => {
      render(
        <Provider store={store}>
          <ResetPasswordPopup open onReset={onReset} onClose={onClose} />
        </Provider>,
      );
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });
    it('should render one confirm button', () => {
      render(
        <Provider store={store}>
          <ResetPasswordPopup open onReset={onReset} onClose={onClose} />
        </Provider>,
      );
      expect(screen.getByRole('button', { name: /reset password/i }));
    });
    it('should render two close buttons', () => {
      render(
        <Provider store={store}>
          <ResetPasswordPopup open onReset={onReset} onClose={onClose} />
        </Provider>,
      );
      expect(screen.getAllByRole('button', { name: /close/i })).toHaveLength(2);
    });
  });
  describe('Behavior', () => {
    it('should change value while the user type in the textbox ', async () => {
      render(
        <Provider store={store}>
          <ResetPasswordPopup open onReset={onReset} onClose={onClose} />
        </Provider>,
      );
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'test', {
        allAtOnce: false,
      });
      expect(screen.getByLabelText(/confirm password/i)).toHaveValue('test');
      await userEvent.type(screen.getByLabelText(/new password/i), 'test', { allAtOnce: false });
      expect(screen.getByLabelText(/new password/i)).toHaveValue('test');
    });
    it('should fire onClose() once the user clicks the close buttons', () => {
      render(
        <Provider store={store}>
          <ResetPasswordPopup open onReset={onReset} onClose={onClose} />
        </Provider>,
      );
      screen.getAllByRole('button', { name: /close/i }).forEach(button => userEvent.click(button));
      expect(onClose).toHaveBeenCalledTimes(2);
    });
    it('should popup error when the password length does not meet the requirement', async () => {
      render(
        <Provider store={store}>
          <ResetPasswordPopup open onReset={onReset} onClose={onClose} />
        </Provider>,
      );
      await userEvent.type(screen.getByLabelText(/new password/i), 'AB@12345!', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'AB@12345!', {
        allAtOnce: false,
      });
      await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(screen.getByText(invalidPasswordError)).toBeInTheDocument();
    });
    it('should popup error when the password contains illegal symbol', async () => {
      render(
        <Provider store={store}>
          <ResetPasswordPopup open onReset={onReset} onClose={onClose} />
        </Provider>,
      );
      await userEvent.type(screen.getByLabelText(/new password/i), 'AB@12345.', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'AB@12345.', {
        allAtOnce: false,
      });
      await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(screen.getByText(invalidPasswordError)).toBeInTheDocument();
    });
    it('should popup error when the password contains only numbers', async () => {
      render(
        <Provider store={store}>
          <ResetPasswordPopup open onReset={onReset} onClose={onClose} />
        </Provider>,
      );
      await userEvent.type(screen.getByLabelText(/new password/i), '12345678', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/confirm password/i), '12345678', {
        allAtOnce: false,
      });
      await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(screen.getByText(invalidPasswordError)).toBeInTheDocument();
    });
    it('should popup error when the password contains only characters', async () => {
      render(
        <Provider store={store}>
          <ResetPasswordPopup open onReset={onReset} onClose={onClose} />
        </Provider>,
      );
      await userEvent.type(screen.getByLabelText(/new password/i), 'qazwsxedc', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'qazwsxedc', {
        allAtOnce: false,
      });
      await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(screen.getByText(invalidPasswordError)).toBeInTheDocument();
    });
    it('should popup error when the password is left blank', async () => {
      render(
        <Provider store={store}>
          <ResetPasswordPopup open onReset={onReset} onClose={onClose} />
        </Provider>,
      );
      await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(screen.getByText(invalidPasswordError)).toBeInTheDocument();
    });

    it('should fire onReset() once the user clicks reset button', async () => {
      render(
        <Provider store={store}>
          <ResetPasswordPopup open onReset={onReset} onClose={onClose} />
        </Provider>,
      );
      await userEvent.type(screen.getByLabelText(/new password/i), 'ABc@12345!', {
        allAtOnce: false,
      });
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'ABc@12345!', {
        allAtOnce: false,
      });
      await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });
});
