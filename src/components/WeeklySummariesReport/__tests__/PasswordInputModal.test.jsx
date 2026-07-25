import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import axios from 'axios';
import { toast } from 'react-toastify';
import PasswordInputModal from '../PasswordInputModal';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
  },
}));

const mockStore = configureStore([]);
const mockOnClose = vi.fn();
const mockCheckForValidPwd = vi.fn();
const mockSetSummaryRecepientsPopup = vi.fn();
const mockSetAuthpassword = vi.fn();

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
          open
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

    await userEvent.type(passwordInput, 'correctPassword'); // ✅ Fix: Await userEvent
    fireEvent.click(authorizeButton);

    await waitFor(() => {
      expect(mockCheckForValidPwd).toHaveBeenCalledWith(true);
    });

    await waitFor(() => {
      expect(mockSetAuthpassword).toHaveBeenCalledWith('correctPassword');
    });

    await waitFor(() => {
      expect(mockSetSummaryRecepientsPopup).toHaveBeenCalledWith(true);
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Authorization successful! Please wait to see Recipients table!',
      );
    });
  });
});
