import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';

describe('ToggleSwitch Component', () => {
  const mockHandleUserProfile = jest.fn();
  
  beforeEach(() => {
    // Clear mock calls between tests
    mockHandleUserProfile.mockClear();
  });

  describe('bluesquares switch type', () => {
    test('renders correctly when state is false', () => {
      render(
        <ToggleSwitch 
          switchType="bluesquares" 
          state={false} 
          handleUserProfile={mockHandleUserProfile} 
        />
      );
      
      const switchElement = screen.getByTestId('blue-switch');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toBeChecked();
    });

    test('calls handleUserProfile when toggled', () => {
      render(
        <ToggleSwitch 
          switchType="bluesquares" 
          state={true} 
          handleUserProfile={mockHandleUserProfile} 
        />
      );
      
      const switchElement = screen.getByTestId('blue-switch');
      fireEvent.click(switchElement);
      expect(mockHandleUserProfile).toHaveBeenCalledTimes(1);
    });

    test('applies custom toggleClass when provided', () => {
      const { container } = render(
        <ToggleSwitch 
          switchType="bluesquares" 
          state={true} 
          handleUserProfile={mockHandleUserProfile}
          toggleClass="custom-toggle"
        />
      );
      
      const divElement = container.querySelector('.blueSqare');
      expect(divElement).toHaveClass('custom-toggle');
    });

    test('applies dark mode styling when darkMode is true', () => {
      render(
        <ToggleSwitch 
          switchType="bluesquares" 
          state={true} 
          handleUserProfile={mockHandleUserProfile}
          darkMode={true}
        />
      );
      
      const switchElement = screen.getByTestId('blue-switch');
      expect(switchElement).toHaveClass('toggleDark');
      expect(switchElement).not.toHaveClass('toggle');
    });
  });

  describe('email switch type', () => {
    test('renders correctly when state is false', () => {
      render(
        <ToggleSwitch 
          switchType="email" 
          state={false} 
          handleUserProfile={mockHandleUserProfile} 
        />
      );
      
      const switchElement = screen.getByTestId('email-switch');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toBeChecked();
    });

    test('calls handleUserProfile when toggled', () => {
      render(
        <ToggleSwitch 
          switchType="email" 
          state={true} 
          handleUserProfile={mockHandleUserProfile} 
        />
      );
      
      const switchElement = screen.getByTestId('email-switch');
      fireEvent.click(switchElement);
      expect(mockHandleUserProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('email-subcription switch type', () => {
    test('renders correctly when state is false', () => {
      render(
        <ToggleSwitch 
          switchType="email-subcription" 
          state={false} 
          handleUserProfile={mockHandleUserProfile} 
        />
      );
      
      const switchElement = screen.getByTestId('email-subcription-switch');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toBeChecked();
    });
  });

  describe('phone switch type', () => {
    test('renders correctly when state is true', () => {
      render(
        <ToggleSwitch 
          switchType="phone" 
          state={true} 
          handleUserProfile={mockHandleUserProfile} 
        />
      );
      
      const switchElement = screen.getByTestId('phone-switch');
      expect(switchElement).toBeInTheDocument();
    });

    test('renders correctly when state is false', () => {
      render(
        <ToggleSwitch 
          switchType="phone" 
          state={false} 
          handleUserProfile={mockHandleUserProfile} 
        />
      );
      
      const switchElement = screen.getByTestId('phone-switch');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toBeChecked();
    });
  });

  describe('visible switch type', () => {
    test('renders correctly when state is false', () => {
      render(
        <ToggleSwitch 
          switchType="visible" 
          state={false} 
          handleUserProfile={mockHandleUserProfile} 
        />
      );
      
      const switchElement = screen.getByTestId('visibility-switch');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toBeChecked();
    });
  });

  describe('bio switch type', () => {
    test('passes font styling props correctly', () => {
      const { container } = render(
        <ToggleSwitch 
          switchType="bio" 
          state="default" 
          handleUserProfile={mockHandleUserProfile}
          fontSize="14px"
          fontColor="red"
        />
      );
      
      const switchSection = container.querySelector('div.switchSection');
      expect(switchSection).toHaveStyle({ fontSize: '14px', color: 'red' });
    });
  });

  describe('active_members switch type', () => {
    test('renders correctly when state is false', () => {
      render(
        <ToggleSwitch 
          switchType="active_members" 
          state={false} 
          handleUserProfile={mockHandleUserProfile} 
        />
      );
      
      const switchElement = screen.getByTestId('active-switch');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toBeChecked();
    });
  });

  test('renders error message for invalid switch type', () => {
    render(
      <ToggleSwitch 
        switchType="invalid" 
        state={true} 
        handleUserProfile={mockHandleUserProfile} 
      />
    );
    
    expect(screen.getByText('ERROR: Toggle Switch.')).toBeInTheDocument();
  });
});