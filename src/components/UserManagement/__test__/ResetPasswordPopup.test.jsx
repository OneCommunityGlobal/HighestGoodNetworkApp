// import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import ResetPasswordPopup from '../ResetPasswordPopup';
import { themeMock } from '../../../__tests__/mockStates';

const initialState = {
  theme: themeMock,
};
const mockStore = configureStore([]);
const store = mockStore(initialState);


const invalidPasswordError =
  'Please choose a strong password which is at least 8 characters long and should contains a digit , a capital letter and a special character.';

describe('reset password popup', () => {
  let onClose;
  let onReset;
  const renderPopup = (onReset, onClose) => {
   render(
      <Provider store={store}>
        <ResetPasswordPopup open onReset={onReset} onClose={onClose} />
      </Provider>,
    );
  }
  beforeEach(() => {
   onClose = vi.fn();
   onReset = vi.fn();
  });
  describe('Structure', () => {
    it('should render two password input field', () => {
      renderPopup(onReset, onClose);
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });
    it('should render one confirm button', () => {
      renderPopup(onReset, onClose);
      expect(screen.getByRole('button', { name: /reset password/i }));
    });
    it('should render two close buttons', () => {
      renderPopup(onReset, onClose);
      expect(screen.getAllByRole('button', { name: /close/i })).toHaveLength(2);
    });
  });
  describe('Behavior', () => {
    it('should change value while the user type in the textbox ', async () => {
      renderPopup(onReset, onClose);
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'test', {
        allAtOnce: false,
      });
      expect(screen.getByLabelText(/confirm password/i)).toHaveValue('test');
      await userEvent.type(screen.getByLabelText(/new password/i), 'test', { allAtOnce: false });
      expect(screen.getByLabelText(/new password/i)).toHaveValue('test');
    });
    it('should fire onClose() once the user clicks the close buttons', async () => {
      renderPopup(onReset, onClose);
      await screen.getAllByRole('button', { name: /close/i }).forEach(button => userEvent.click(button));
      expect(onClose).toHaveBeenCalledTimes(2);
    });
    it('should popup error when the password length does not meet the requirement', async () => {
      renderPopup(onReset, onClose);
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
      renderPopup(onReset, onClose);
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
      renderPopup(onReset, onClose);
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
      renderPopup(onReset, onClose);
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
      renderPopup(onReset, onClose);
      await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(screen.getByText(invalidPasswordError)).toBeInTheDocument();
    });

    it('should fire onReset() once the user clicks reset button', async () => {
      renderPopup(onReset, onClose);
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
