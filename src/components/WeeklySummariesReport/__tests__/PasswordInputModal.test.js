import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import PasswordInputModal from '../PasswordInputModal';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import axios from 'axios';
import { toast } from 'react-toastify';

jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
  },
}));

const mockStore = configureStore([]);
const mockOnClose = jest.fn();
const mockCheckForValidPwd = jest.fn();
const mockSetSummaryRecepientsPopup = jest.fn();
const mockSetAuthpassword = jest.fn();

describe('PasswordInputModal', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      theme: { darkMode: false },
    });
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <PasswordInputModal
          onClose={mockOnClose}
          open={true}
          checkForValidPwd={mockCheckForValidPwd}
          isValidPwd={false}
          setSummaryRecepientsPopup={mockSetSummaryRecepientsPopup}
          setAuthpassword={mockSetAuthpassword}
          authEmailWeeklySummaryRecipient="test@example.com"
        />
      </Provider>,
    );

  test('renders the modal with input field and buttons', () => {
    renderComponent();

    expect(screen.getByText(/Password to Authorise User/i)).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Authorize/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  test('toggles password visibility when eye icon is clicked', () => {
    renderComponent();

    const passwordInput = screen.getByTestId('password-input');
    const eyeIcon = screen.getByRole('img', { hidden: true });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(eyeIcon);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(eyeIcon);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('calls onClose when Cancel button is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls success flow when the password is correct', async () => {
    axios.post.mockResolvedValueOnce({
      status: 200,
      data: { message: 'Success', password: 'correctPassword' },
    });

    renderComponent();

    const passwordInput = screen.getByTestId('password-input');
    const authorizeButton = screen.getByRole('button', { name: /Authorize/i });

    userEvent.type(passwordInput, 'correctPassword');
    fireEvent.click(authorizeButton);

    await waitFor(() => {
      expect(mockCheckForValidPwd).toHaveBeenCalledWith(true);
      expect(mockSetAuthpassword).toHaveBeenCalledWith('correctPassword');
      expect(mockSetSummaryRecepientsPopup).toHaveBeenCalledWith(true);
      expect(mockOnClose).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        'Authorization successful! Please wait to see Recipients table!',
      );
    });
  });
});
