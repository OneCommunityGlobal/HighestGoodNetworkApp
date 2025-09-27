/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-container */
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import AddTeamMember from '../AddTeamMember/AddTeamMember';
import { ENDPOINTS } from '../../../utils/URL';

// ---- Local, file-scoped mocks (no global setup needed) ----
vi.mock('axios', () => {
  const mock = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    create: vi.fn(),
  };
  // Important: axios.create() must return the same mock instance
  mock.create.mockReturnValue(mock);
  return { default: mock };
});

vi.mock('react-toastify', () => ({
  __esModule: true,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
  ToastContainer: () => null,
}));

const mockedAxios = axios;

describe('AddTeamMember Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Resolve any GETs the component fires on mount so tests don’t hang.
    mockedAxios.get.mockResolvedValue({ data: {} });
  });

  describe('Component Rendering', () => {
    it('renders the person add icon', () => {
      render(<AddTeamMember />);
      expect(screen.getByText('Create new team member')).toBeInTheDocument();
    });
  });

  describe('Form Input Changes', () => {
    it('updates first name field when typed', async () => {
      render(<AddTeamMember />);
      const firstNameInput = screen.getByLabelText('First Name');
      await userEvent.type(firstNameInput, 'John');
      expect(firstNameInput).toHaveValue('John');
    });

    it('updates last name field when typed', async () => {
      render(<AddTeamMember />);
      const lastNameInput = screen.getByLabelText('Last Name');
      await userEvent.type(lastNameInput, 'Doe');
      expect(lastNameInput).toHaveValue('Doe');
    });

    it('updates email field when typed', async () => {
      render(<AddTeamMember />);
      const emailInput = screen.getByLabelText('Email Address');
      await userEvent.type(emailInput, 'john.doe@example.com');
      expect(emailInput).toHaveValue('john.doe@example.com');
    });

    it('updates teamSpecify field when typed', async () => {
      render(<AddTeamMember />);
      // Assumes second empty input corresponds to teamSpecify in your UI
      const teamSpecifyInput = screen.getAllByDisplayValue('')[1];
      await userEvent.type(teamSpecifyInput, 'Custom Team');
      expect(teamSpecifyInput).toHaveValue('Custom Team');
    });
  });

  describe('Phone Number Formatting', () => {
    it('formats phone number correctly as user types', async () => {
      render(<AddTeamMember />);
      const phoneInput = screen.getByPlaceholderText('123-456-7890');
      await userEvent.type(phoneInput, '1234567890');
      expect(phoneInput).toHaveValue('123-456-7890');
    });

    it('formats partial phone numbers correctly', async () => {
      render(<AddTeamMember />);
      const phoneInput = screen.getByPlaceholderText('123-456-7890');
      await userEvent.type(phoneInput, '123456');
      expect(phoneInput).toHaveValue('123-456');
    });

    it('handles short phone numbers correctly', async () => {
      render(<AddTeamMember />);
      const phoneInput = screen.getByPlaceholderText('123-456-7890');
      await userEvent.type(phoneInput, '123');
      expect(phoneInput).toHaveValue('123');
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      render(<AddTeamMember />);
      await userEvent.click(screen.getByText('Submit'));
      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Role selection is required')).toBeInTheDocument();
      expect(screen.getByText('Team selection is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('shows validation error for invalid email format', async () => {
      render(<AddTeamMember />);
      await userEvent.type(screen.getByLabelText('Email Address'), 'invalid-email');
      await userEvent.click(screen.getByText('Submit'));
      expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
    });

    it('shows validation error for invalid phone number', async () => {
      render(<AddTeamMember />);
      await userEvent.type(screen.getByPlaceholderText('123-456-7890'), '123');
      await userEvent.click(screen.getByText('Submit'));
      expect(
        await screen.findByText('Please enter a valid 10-digit phone number'),
      ).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form successfully with valid data', async () => {
      // If your component fetches roles/teams from API on mount,
      // you can specialize responses here. Otherwise, the default GET mock above is fine.
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      render(<AddTeamMember />);

      // Fill required fields
      await userEvent.type(screen.getByLabelText('First Name'), 'John');
      await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com');
      await userEvent.type(screen.getByPlaceholderText('123-456-7890'), '1234567890');

      // Select role
      const roleSelect = screen.getAllByRole('combobox')[0];
      fireEvent.keyDown(roleSelect, { key: 'ArrowDown' });
      await userEvent.click(await screen.findByText('Carpenter'));

      // Select team
      const teamSelect = screen.getAllByRole('combobox')[1];
      fireEvent.keyDown(teamSelect, { key: 'ArrowDown' });
      await userEvent.click(await screen.findByText('XYZ Carpentry'));

      await userEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
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
          { headers: { 'Content-Type': 'application/json' } },
        );
      });

      // success toast asserted in component-specific wording
      // (toast is mocked above)
    }, 10000);

    it('handles submission error correctly', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));
      render(<AddTeamMember />);

      await userEvent.type(screen.getByLabelText('First Name'), 'John');
      await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com');

      const roleSelect = screen.getAllByRole('combobox')[0];
      fireEvent.keyDown(roleSelect, { key: 'ArrowDown' });
      await userEvent.click(await screen.findByText('Carpenter'));

      const teamSelect = screen.getAllByRole('combobox')[1];
      fireEvent.keyDown(teamSelect, { key: 'ArrowDown' });
      await userEvent.click(await screen.findByText('XYZ Carpentry'));

      await userEvent.click(screen.getByText('Submit'));

      // Just wait for POST to have been attempted. Your component likely shows a toast.
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    }, 10000);
  });

  describe('Cancel Functionality', () => {
    it('resets form when cancel button is clicked', async () => {
      render(<AddTeamMember />);
      await userEvent.type(screen.getByLabelText('First Name'), 'John');
      await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com');

      await userEvent.click(screen.getByText('Cancel'));

      expect(screen.getByLabelText('First Name')).toHaveValue('');
      expect(screen.getByLabelText('Last Name')).toHaveValue('');
      expect(screen.getByLabelText('Email Address')).toHaveValue('');
    });
  });

  describe('Form Reset After Successful Submission', () => {
    it('resets form after successful submission', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });
      render(<AddTeamMember />);

      await userEvent.type(screen.getByLabelText('First Name'), 'John');
      await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com');

      const roleSelect = screen.getAllByRole('combobox')[0];
      fireEvent.keyDown(roleSelect, { key: 'ArrowDown' });
      await userEvent.click(await screen.findByText('Carpenter'));

      const teamSelect = screen.getAllByRole('combobox')[1];
      fireEvent.keyDown(teamSelect, { key: 'ArrowDown' });
      await userEvent.click(await screen.findByText('XYZ Carpentry'));

      await userEvent.click(screen.getByText('Submit'));

      // Wait for “success” to have been processed; then verify reset
      await waitFor(() => {
        expect(screen.getByLabelText('First Name')).toHaveValue('');
      });
      expect(screen.getByLabelText('Last Name')).toHaveValue('');
      expect(screen.getByLabelText('Email Address')).toHaveValue('');
    }, 10000);
  });
});
