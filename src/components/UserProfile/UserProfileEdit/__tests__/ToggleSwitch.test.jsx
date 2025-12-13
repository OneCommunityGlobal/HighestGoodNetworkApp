import React from 'react';
import { vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';

describe('ToggleSwitch Component', () => {
  const mockHandleUserProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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
      // state=false means the checkbox is checked
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
      
      fireEvent.click(screen.getByTestId('blue-switch'));
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
      
      // your component wraps the checkbox in a div.blueSqare
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const wrapper = container.querySelector('div[class*="blueSqare"]');
      expect(wrapper).toHaveClass('custom-toggle');
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

      // since CSS modules hash the class, just assert the classname contains "toggleDark"
      expect(switchElement.className).toContain('toggleDark');
      expect(switchElement.className).not.toContain('toggle ');
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
      
      fireEvent.click(screen.getByTestId('email-switch'));
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
      
      expect(screen.getByTestId('phone-switch')).toBeInTheDocument();
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
      
      // match the CSS‐module class name for the outer section
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const section = container.querySelector('div[class*="switchSection"]');
      expect(section).not.toBeNull();
      const sectionColor = window.getComputedStyle(section).color;
      expect(section).toHaveStyle({ fontSize: '14px' });
      expect(['rgb(255, 0, 0)', 'red']).toContain(sectionColor);
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