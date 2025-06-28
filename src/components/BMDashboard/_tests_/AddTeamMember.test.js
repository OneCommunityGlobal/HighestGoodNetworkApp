import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AddTeamMember from '../AddTeamMember/AddTeamMember';
import { ENDPOINTS } from '../../../utils/URL';

// Mock dependencies
jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedAxios = axios;

describe('AddTeamMember Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      
      const teamSpecifyInput = screen.getAllByDisplayValue('')[1]; // Second empty input is teamSpecify
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
      
      const submitButton = screen.getByText('Submit');
      userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
        expect(screen.getByText('Role selection is required')).toBeInTheDocument();
        expect(screen.getByText('Team selection is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid email format', async () => {
      render(<AddTeamMember />);
      
      const emailInput = screen.getByLabelText('Email Address');
      await userEvent.type(emailInput, 'invalid-email');
      
      const submitButton = screen.getByText('Submit');
      userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid phone number', async () => {
      render(<AddTeamMember />);
      
      const phoneInput = screen.getByPlaceholderText('123-456-7890');
      await userEvent.type(phoneInput, '123');
      
      const submitButton = screen.getByText('Submit');
      userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid 10-digit phone number')).toBeInTheDocument();
      });
    });


  });

  describe('Form Submission', () => {
    it('submits form successfully with valid data', async () => {
      const mockResponse = { data: { success: true } };
      mockedAxios.post.mockResolvedValue(mockResponse);
      
      render(<AddTeamMember />);
      
      // Fill all required fields
      await userEvent.type(screen.getByLabelText('First Name'), 'John');
      await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com');
      await userEvent.type(screen.getByPlaceholderText('123-456-7890'), '1234567890');
      
      // Select role
      const roleSelect = screen.getAllByRole('combobox')[0]; // First combobox is roles
      fireEvent.keyDown(roleSelect, { key: 'ArrowDown' });
      userEvent.click(screen.getByText('Carpenter'));
      
      // Select team
      const teamSelect = screen.getAllByRole('combobox')[1]; // Second combobox is teams
      fireEvent.keyDown(teamSelect, { key: 'ArrowDown' });
      userEvent.click(screen.getByText('XYZ Carpentry'));
      
      const submitButton = screen.getByText('Submit');
      userEvent.click(submitButton);
      
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
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      });
      
      expect(toast.success).toHaveBeenCalledWith('Team member created successfully!');
    });

    it('handles submission error correctly', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));
      
      render(<AddTeamMember />);
      
      // Fill all required fields
      await userEvent.type(screen.getByLabelText('First Name'), 'John');
      await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com');
      
      // Select role
      const roleSelect = screen.getAllByRole('combobox')[0]; // First combobox is roles
      fireEvent.keyDown(roleSelect, { key: 'ArrowDown' });
      userEvent.click(screen.getByText('Carpenter'));
      
      // Select team
      const teamSelect = screen.getAllByRole('combobox')[1]; // Second combobox is teams
      fireEvent.keyDown(teamSelect, { key: 'ArrowDown' });
      userEvent.click(screen.getByText('XYZ Carpentry'));
      
      const submitButton = screen.getByText('Submit');
      userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to create team member. Please try again.');
      });
    });


  });

  describe('Cancel Functionality', () => {
    it('resets form when cancel button is clicked', async () => {
      render(<AddTeamMember />);
      
      // Fill some fields
      await userEvent.type(screen.getByLabelText('First Name'), 'John');
      await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com');
      
      // Click cancel
      const cancelButton = screen.getByText('Cancel');
      userEvent.click(cancelButton);
      
      // Check that fields are cleared
      expect(screen.getByLabelText('First Name')).toHaveValue('');
      expect(screen.getByLabelText('Last Name')).toHaveValue('');
      expect(screen.getByLabelText('Email Address')).toHaveValue('');
    });
  });



  describe('Form Reset After Successful Submission', () => {
    it('resets form after successful submission', async () => {
      const mockResponse = { data: { success: true } };
      mockedAxios.post.mockResolvedValue(mockResponse);
      
      render(<AddTeamMember />);
      
      // Fill all required fields
      await userEvent.type(screen.getByLabelText('First Name'), 'John');
      await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com');
      
      // Select role
      const roleSelect = screen.getAllByRole('combobox')[0]; // First combobox is roles
      fireEvent.keyDown(roleSelect, { key: 'ArrowDown' });
      userEvent.click(screen.getByText('Carpenter'));
      
      // Select team
      const teamSelect = screen.getAllByRole('combobox')[1]; // Second combobox is teams
      fireEvent.keyDown(teamSelect, { key: 'ArrowDown' });
      userEvent.click(screen.getByText('XYZ Carpentry'));
      
      const submitButton = screen.getByText('Submit');
      userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Team member created successfully!');
      });
      
      // Check that form is reset
      expect(screen.getByLabelText('First Name')).toHaveValue('');
      expect(screen.getByLabelText('Last Name')).toHaveValue('');
      expect(screen.getByLabelText('Email Address')).toHaveValue('');
    });
  });
}); 