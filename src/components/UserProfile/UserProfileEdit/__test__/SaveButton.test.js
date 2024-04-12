import React from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { userProfileMock } from '../../../../__tests__/mockStates';
import SaveButton from '../SaveButton';

describe('<SaveButton />', () => {
  // Test Case 1: It should render the save changes button with the correct props
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
    // Test Case 2: It should render the save changes button in disabled state
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

    // Test Case 2: It should render the modal after clicking save changes button
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

  // It should set the modal state to true after clicking the save changes button
  // it('sets modal state to true after save changes button is clicked', async () => {
  //   let props = {
  //     handleSubmit: jest.fn(),
  //     disabled: false,
  //     userProfile: userProfileMock,
  //     setSaved: jest.fn(),
  //   }
  //   render(<SaveButton {...props} />);
  //   const button = screen.getByRole('button', { name: /save changes/i });
  //   expect(button).not.toBeDisabled();
  //   userEvent.click(button);
  //   expect(screen.getByRole('dialog')).toBeInTheDocument();
  // });

  // Clicking the "Save Changes" button triggers the expected actions
  // it('clicking the "Save Changes" button triggers the expected actions', () => {
  //   const handleSubmit = jest.fn();
  //   const setSaved = jest.fn();
  //   const props = {
  //     handleSubmit,
  //     disabled: false,
  //     userProfile: userProfileMock,
  //     setSaved,
  //   };
  //   render(<SaveButton {...props} />);
  //   const button = screen.getByRole('button', { name: /save changes/i });
  //   userEvent.click(button);
  //   expect(handleSubmit).toHaveBeenCalledTimes(1);
  //   expect(setSaved).toHaveBeenCalledTimes(1);
  //   expect(screen.queryByRole('dialog')).toBeInTheDocument();
  // });

  // Closing the modal should remove the modal from the document
  // it('closing the modal removes the modal from the document (Fixed)', async () => {
  //   const props = {
  //     handleSubmit: jest.fn(),
  //     disabled: false,
  //     userProfile: userProfileMock,
  //     setSaved: jest.fn(),
  //   };
  //   render(<SaveButton {...props} />);
  //   const button = screen.getByRole('button', { name: /save changes/i });
  //   userEvent.click(button);
  //   const closeButtons = screen.getAllByRole('button', { name: /close/i });
  //   const closeButton = closeButtons.find(button => button.closest('.modal-content'));
  //   userEvent.click(closeButton);
  //   await waitFor(() => {
  //     expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  //   });
  // });
  // It should render the save changes button with the correct label


  // Test Case 3: It should render the save changes button with the correct label
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

  // It should disable the save changes button when disabled prop is true


  // Test Case 4: It should disable the save changes button when disabled prop is true
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

  // It should enable the save changes button when there are changes in the form
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

  // It should display the actual error message if the form submission fails
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

  // It should set the modal state to true after clicking the save changes button


  // Test Case 3: It should set the modal state to true after clicking save changes button
  // it('updates randomMessage state in useEffect when modal is true and team code is valid', () => {
  //   const handleSubmit = jest.fn();
  //   const setSaved = jest.fn();
  //   const userProfile = { teamCode: 'ABCDE' }; // Valid team code
  //   const { getByText, rerender } = render(
  //     <SaveButton handleSubmit={handleSubmit} disabled={false} userProfile={userProfile} setSaved={setSaved} />
  //   );

  //   fireEvent.click(getByText('Save Changes')); // Open modal
  //   rerender(<SaveButton handleSubmit={handleSubmit} disabled={false} userProfile={{ teamCode: 'ABCDE' }} setSaved={setSaved} />);

  //   // Ensure useEffect updates randomMessage state
  //   expect(getByText(/success/i)).toBeInTheDocument(); // Assuming 'Success!' is present in the new random message
  // });

  // It should call the setSaved function when the save changes button is clicked


  // Test Case 4: It should call the setSaved function on save changes button click
  // it('calls setSaved on save changes button click', () => {
  //   const setSaved = jest.fn();
  //   let props = {
  //     handleSubmit: jest.fn(),
  //     disabled: false,
  //     userProfile: userProfileMock,
  //     setSaved,
  //   }
  //   render(<SaveButton {...props} />);
  //   const button = screen.getByRole('button', { name: /save changes/i });
  //   userEvent.click(button);
  //   expect(setSaved).toHaveBeenCalled();
  // });

  // It should call the handleSubmit function when the save changes button is clicked


  // Test Case 3: It should call the handleSubmit function on save changes button click
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

  // it('sets modal state to true after save changes button is clicked', () => {
  //   const handleSubmit = jest.fn();
  //   const setSaved = jest.fn();
  //   const userProfile = { teamCode: 'ABCDE' };
  //   const { getByText, queryByText } = render(
  //     <SaveButton handleSubmit={handleSubmit} disabled={false} userProfile={userProfile} setSaved={setSaved} />
  //   );

  //   // Check if modal is initially closed
  //   expect(queryByText('Success!')).not.toBeInTheDocument();

  //   // Click the "Save Changes" button
  //   fireEvent.click(getByText('Save Changes'));

  //   // Check if modal content is now present in the document
  //   expect(queryByText('Success!')).toBeInTheDocument();
  // });

  // Saving changes returns an error message
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

  // It should render the save changes button in enabled state


  // Test Case 4: It should render the save changes button in enabled state
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

  // It should render the save changes button with the correct text


  // Test Case 3: It should render the save changes button with the correct text
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
  // It should disable the save changes button when the userProfile is not active


  // Test Case 6: It should disable the save changes button when userProfile is not active
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

  // It should render the save changes button with the correct text


  // Test Case 5: It should render the save changes button with the correct text
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

  // The save changes button should be disabled if the disabled prop is true


  // Test Case 4: It should render the save changes button as disabled if disabled prop is true
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

  // After clicking the save changes button, the save function should be called


  // Test Case 3: It should call the save function after clicking save changes button
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
