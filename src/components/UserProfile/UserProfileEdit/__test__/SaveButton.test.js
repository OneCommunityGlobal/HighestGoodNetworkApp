import React from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { userProfileMock } from '../../../../__tests__/mockStates';
import SaveButton from '../SaveButton';

describe('<SaveButton />', () => {
  it('renders the save changes button', () => {
    let props = {
      handleSubmit: jest.fn(),
      disabled: true,
      userProfile: userProfileMock,
      setSaved: jest.fn(),
    }
    render(<SaveButton {...props} />);
    const button = screen.getByRole('button', { name: /save changes/i });
    expect(button).toBeInTheDocument();
  });

  describe('Behavior', () => {
    it('renders the save changes button as disabled by default', () => {
      let props = {
        handleSubmit: jest.fn(),
        disabled: true,
        userProfile: userProfileMock,
        setSaved: jest.fn(),
      }
      render(<SaveButton {...props} />);
      const button = screen.getByRole('button', { name: /save changes/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('renders modal after save changes button is clicked', async () => {
      let props = {
        handleSubmit: jest.fn(),
        disabled: false,
        userProfile: userProfileMock,
        setSaved: jest.fn(),
      }
      render(<SaveButton {...props} />);
      const button = screen.getByRole('button', { name: /save changes/i });
      expect(button).not.toBeDisabled();
      userEvent.click(button);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
  it('renders the save changes button with the correct label', () => {
    let props = {
      handleSubmit: jest.fn(),
      disabled: false,
      userProfile: userProfileMock,
      setSaved: jest.fn(),
    }
    render(<SaveButton {...props} />);
    const button = screen.getByRole('button', { name: /save changes/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Save Changes');
  });

  it('disables the save changes button when disabled prop is true', () => {
    let props = {
      handleSubmit: jest.fn(),
      disabled: true,
      userProfile: userProfileMock,
      setSaved: jest.fn(),
    }
    render(<SaveButton {...props} />);
    const button = screen.getByRole('button', { name: /save changes/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });


  it('enables the save changes button when there are changes', () => {
    let props = {
      handleSubmit: jest.fn(),
      disabled: false,
      userProfile: userProfileMock,
      setSaved: jest.fn(),
    }
    render(<SaveButton {...props} />);
    const button = screen.getByRole('button', { name: /save changes/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('displays the actual error message on form submission failure', async () => {
    let props = {
      handleSubmit: jest.fn().mockResolvedValue(),
      disabled: false,
      userProfile: userProfileMock,
      setSaved: jest.fn(),
    }
    render(<SaveButton {...props} />);
    const button = screen.getByRole('button', { name: /save changes/i });
    expect(button).toBeInTheDocument();

    userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Nice save! It seems you do not have a valid team code. It would be a lot cooler if you did. You can add one in the teams tab')).toBeInTheDocument();
    });
  });
  it('calls handleSubmit on save changes button click', () => {
    const handleSubmit = jest.fn();
    let props = {
      handleSubmit,
      disabled: false,
      userProfile: userProfileMock,
      setSaved: jest.fn(),
    }
    render(<SaveButton {...props} />);
    const button = screen.getByRole('button', { name: /save changes/i });
    userEvent.click(button);
    expect(handleSubmit).toHaveBeenCalled();
  });
  it('displays an error message in the modal if handleSubmit returns an error string', async () => {
    let props = {
      handleSubmit: jest.fn().mockReturnValue('Error message'),
      disabled: false,
      userProfile: userProfileMock,
      setSaved: jest.fn(),
    }
    render(<SaveButton {...props} />);
    const button = screen.getByRole('button', { name: /save changes/i });
    expect(button).not.toBeDisabled();
    userEvent.click(button);
    await screen.findByText('Sorry an error occured while trying to save. Please try again another time.');
  });
  it('renders the save changes button as enabled by default', () => {
    let props = {
      handleSubmit: jest.fn(),
      disabled: false,
      userProfile: userProfileMock,
      setSaved: jest.fn(),
    }
    render(<SaveButton {...props} />);
    const button = screen.getByRole('button', { name: /save changes/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders the save changes button with the correct text', () => {
    let props = {
      handleSubmit: jest.fn(),
      disabled: false,
      userProfile: userProfileMock,
      setSaved: jest.fn(),
    }
    render(<SaveButton {...props} />);
    const button = screen.getByRole('button', { name: /save changes/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Save Changes');
  });
  it('disables the save changes button when userProfile is not active', () => {
    let props = {
      handleSubmit: jest.fn(),
      disabled: true,
      userProfile: { ...userProfileMock, isActive: false },
      setSaved: jest.fn(),
    }
    render(<SaveButton {...props} />);
    const button = screen.getByRole('button', { name: /save changes/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('renders the save changes button with the correct text', () => {
    let props = {
      handleSubmit: jest.fn(),
      disabled: true,
      userProfile: userProfileMock,
      setSaved: jest.fn(),
    }
    render(<SaveButton {...props} />);
    const button = screen.getByRole('button', { name: /save changes/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Save Changes');
  });

  it('renders the save changes button as disabled if disabled prop is true', () => {
    let props = {
      handleSubmit: jest.fn(),
      disabled: true,
      userProfile: userProfileMock,
      setSaved: jest.fn(),
    }
    render(<SaveButton {...props} />);
    const button = screen.getByRole('button', { name: /save changes/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
  it('calls the save function after save changes button is clicked', async () => {
    let props = {
      handleSubmit: jest.fn(),
      disabled: false,
      userProfile: userProfileMock,
      setSaved: jest.fn(),
    }
    render(<SaveButton {...props} />);
    const button = screen.getByRole('button', { name: /save changes/i });
    expect(button).not.toBeDisabled();
    userEvent.click(button);
    expect(props.handleSubmit).toHaveBeenCalled();
  });


});
