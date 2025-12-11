import React from 'react';
import { screen, render} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { userProfileMock } from '../../../../__tests__/mockStates';
import SaveButton from '../SaveButton';

describe('<SaveButton />', () => {
  // Test Case 1: It should render the save changes button with the correct props
  it('renders the save changes button', () => {
    let props = {
      handleSubmit: vi.fn(),
      disabled: true,
      userProfile: userProfileMock,
      setSaved:vi.fn(),
      darkMode: true,
      }
    render(<SaveButton {...props} />);
    const button = screen.getByRole('button', { name: /save changes/i });
    expect(button).toBeInTheDocument(); 
  });

  describe('Behavior', () => {
    // Test Case 2: It should render the save changes button in disabled state
    it('renders the save changes button as disabled by default', () => {
      let props = {
        handleSubmit: vi.fn(),
        disabled: true,
        userProfile: userProfileMock,
        setSaved:vi.fn(),
        darkMode: true,
        } 
      render(<SaveButton {...props} />);
      const button = screen.getByRole('button', { name: /save changes/i });
      expect(button).toBeInTheDocument(); 
      expect(button).toBeDisabled(); 
    });

    // Test Case 2: It should render the modal after clicking save changes button
    it('renders modal after save changes button is clicked', async () => {
      let props = {
        handleSubmit: vi.fn(),
        disabled: false,
        userProfile: userProfileMock,
        setSaved:vi.fn(),
        darkMode: true,
        } 
      render(<SaveButton {...props} />);
      const button = screen.getByRole('button', { name: /save changes/i });
      expect(button).not.toBeDisabled(); 
      await userEvent.click(button);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});