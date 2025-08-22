import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AddTeamMember from '../AddTeamMember/AddTeamMember';
import { ENDPOINTS } from '../../../utils/URL';

// Mock dependencies
vi.mock('axios');
vi.mock('react-toastify', () => ({
  __esModule: true,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Create mock store
const createStore = (darkMode = false) =>
  configureStore({
    reducer: {
      theme: () => ({ darkMode }),
    },
  });

// Custom render function with Redux provider
const renderComponent = (darkMode = false) => {
  const store = createStore(darkMode);
  return render(
    <Provider store={store}>
      <AddTeamMember />
    </Provider>,
  );
};

describe('AddTeamMember Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the person add icon', () => {
      renderComponent();
      expect(screen.getByText('Create new team member')).toBeInTheDocument();
    });
  });

  describe('Form Input Changes', () => {
    it('updates first name field when typed', async () => {
      renderComponent();
      const firstNameInput = screen.getByLabelText('First Name');
      await userEvent.type(firstNameInput, 'John');
      expect(firstNameInput).toHaveValue('John');
    });

    it('updates last name field when typed', async () => {
      renderComponent();
      const lastNameInput = screen.getByLabelText('Last Name');
      await userEvent.type(lastNameInput, 'Doe');
      expect(lastNameInput).toHaveValue('Doe');
    });

    it('updates email field when typed', async () => {
      renderComponent();
      const emailInput = screen.getByLabelText('Email Address');
      await userEvent.type(emailInput, 'john.doe@example.com');
      expect(emailInput).toHaveValue('john.doe@example.com');
    });

    it('updates teamSpecify field when typed', async () => {
      renderComponent();
      const inputs = screen.getAllByRole('textbox');
      const teamSpecifyInput = inputs.find(input => input.getAttribute('name') === 'teamSpecify');
      await userEvent.type(teamSpecifyInput, 'Custom Team');
      expect(teamSpecifyInput).toHaveValue('Custom Team');
    });
  });

  describe('Phone Number Formatting', () => {
    it('formats phone number correctly as user types', async () => {
      renderComponent();
      const phoneInput = screen.getByPlaceholderText('123-456-7890');
      await userEvent.type(phoneInput, '1234567890');
      expect(phoneInput).toHaveValue('123-456-7890');
    });

    it('formats partial phone numbers correctly', async () => {
      renderComponent();
      const phoneInput = screen.getByPlaceholderText('123-456-7890');
      await userEvent.type(phoneInput, '123456');
      expect(phoneInput).toHaveValue('123-456');
    });

    it('handles short phone numbers correctly', async () => {
      renderComponent();
      const phoneInput = screen.getByPlaceholderText('123-456-7890');
      await userEvent.type(phoneInput, '123');
      expect(phoneInput).toHaveValue('123');
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      renderComponent();
      const submitButton = screen.getByText('Submit');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Role selection is required')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Team selection is required')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid email format', async () => {
      renderComponent();
      const emailInput = screen.getByLabelText('Email Address');
      await userEvent.type(emailInput, 'invalid-email');
      const submitButton = screen.getByText('Submit');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid phone number', async () => {
      renderComponent();
      const phoneInput = screen.getByPlaceholderText('123-456-7890');
      await userEvent.type(phoneInput, '123');
      const submitButton = screen.getByText('Submit');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid 10-digit phone number')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form successfully with valid data', async () => {
      const mockResponse = { data: { success: true } };
      axios.post.mockResolvedValue(mockResponse);

      renderComponent();

      // Fill all required fields
      await userEvent.type(screen.getByLabelText('First Name'), 'John');
      await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com');
      await userEvent.type(screen.getByPlaceholderText('123-456-7890'), '1234567890');

      // Select role
      const roleSelect = screen.getAllByRole('combobox')[0];
      fireEvent.keyDown(roleSelect, { key: 'ArrowDown' });
      await userEvent.click(screen.getByText('Carpenter'));

      // Select team
      const teamSelect = screen.getAllByRole('combobox')[1];
      fireEvent.keyDown(teamSelect, { key: 'ArrowDown' });
      await userEvent.click(screen.getByText('XYZ Carpentry'));

      const submitButton = screen.getByText('Submit');
      await userEvent.click(submitButton);

      // API call assertion
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          ENDPOINTS.BM_EXTERNAL_TEAM,
          {
            firstName: 'John',
            lastName: 'Doe',
            role: 'carpenter',
            roleSpecify: '',
            team: 'xyz_carpentry',
            teamSpecify: '',
            email: 'john@example.com',
            countryCode: '+1',
            phone: '1234567890',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
      });

      // Toast notification assertion
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Team member created successfully!');
      });
    });

    it('handles submission error correctly', async () => {
      axios.post.mockRejectedValue(new Error('Network error'));

      renderComponent();

      // Fill all required fields
      await userEvent.type(screen.getByLabelText('First Name'), 'John');
      await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com');
      await userEvent.type(screen.getByPlaceholderText('123-456-7890'), '1234567890');

      // Select role
      const roleSelect = screen.getAllByRole('combobox')[0];
      fireEvent.keyDown(roleSelect, { key: 'ArrowDown' });
      await userEvent.click(screen.getByText('Carpenter'));

      // Select team
      const teamSelect = screen.getAllByRole('combobox')[1];
      fireEvent.keyDown(teamSelect, { key: 'ArrowDown' });
      await userEvent.click(screen.getByText('XYZ Carpentry'));

      const submitButton = screen.getByText('Submit');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to create team member. Please try again.');
      });
    });
  });

  describe('Cancel Functionality', () => {
    it('resets form when cancel button is clicked', async () => {
      renderComponent();

      // Fill some fields
      await userEvent.type(screen.getByLabelText('First Name'), 'John');
      await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com');

      // Click cancel
      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);

      // Check that fields are cleared
      expect(screen.getByLabelText('First Name')).toHaveValue('');
      expect(screen.getByLabelText('Last Name')).toHaveValue('');
      expect(screen.getByLabelText('Email Address')).toHaveValue('');
    });
  });

  describe('Form Reset After Successful Submission', () => {
    it('resets form after successful submission', async () => {
      const mockResponse = { data: { success: true } };
      axios.post.mockResolvedValue(mockResponse);

      renderComponent();

      // Fill all required fields
      await userEvent.type(screen.getByLabelText('First Name'), 'John');
      await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com');
      await userEvent.type(screen.getByPlaceholderText('123-456-7890'), '1234567890');

      // Select role
      const roleSelect = screen.getAllByRole('combobox')[0];
      fireEvent.keyDown(roleSelect, { key: 'ArrowDown' });
      await userEvent.click(screen.getByText('Carpenter'));

      // Select team
      const teamSelect = screen.getAllByRole('combobox')[1];
      fireEvent.keyDown(teamSelect, { key: 'ArrowDown' });
      await userEvent.click(screen.getByText('XYZ Carpentry'));

      const submitButton = screen.getByText('Submit');
      await userEvent.click(submitButton);

      // Toast notification assertion
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Team member created successfully!');
      });

      // Check that form is reset
      expect(screen.getByLabelText('First Name')).toHaveValue('');
      expect(screen.getByLabelText('Last Name')).toHaveValue('');
      expect(screen.getByLabelText('Email Address')).toHaveValue('');
      expect(screen.getByPlaceholderText('123-456-7890')).toHaveValue('');
    });
  });
});
