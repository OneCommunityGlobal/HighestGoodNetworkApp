import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ToggleSwitch from '../ToggleSwitch'; // Adjust the import path as necessary

describe('ToggleSwitch Component', () => {
  const mockHandleUserProfile = jest.fn();

  it('should render blue squares switch with default checked when state is false', () => {
    render(<ToggleSwitch switchType="bluesquares" state={false} handleUserProfile={mockHandleUserProfile} />);
    const switchElement = screen.getByTestId('blue-switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toBeChecked();
  });

  it('should render blue squares switch unchecked when state is true', () => {
    render(<ToggleSwitch switchType="bluesquares" state={true} handleUserProfile={mockHandleUserProfile} />);
    const switchElement = screen.getByTestId('blue-switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).not.toBeChecked();
  });

  it('should call handleUserProfile on blue squares switch change', () => {
    render(<ToggleSwitch switchType="bluesquares" state={true} handleUserProfile={mockHandleUserProfile} />);
    const switchElement = screen.getByTestId('blue-switch');
    fireEvent.click(switchElement);
    expect(mockHandleUserProfile).toHaveBeenCalled();
  });

  it('should render email switch with default checked when state is false', () => {
    render(<ToggleSwitch switchType="email" state={false} handleUserProfile={mockHandleUserProfile} />);
    const switchElement = screen.getByTestId('email-switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toBeChecked();
  });

  it('should render phone switch unchecked when state is true', () => {
    render(<ToggleSwitch switchType="phone" state={true} handleUserProfile={mockHandleUserProfile} />);
    const switchElement = screen.getByTestId('phone-switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).not.toBeChecked();
  });

  it('should render visibility switch with default checked when state is false', () => {
    render(<ToggleSwitch switchType="visible" state={false} handleUserProfile={mockHandleUserProfile} />);
    const switchElement = screen.getByTestId('visibility-switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toBeChecked();
  });

  it('should render active members switch unchecked when state is true', () => {
    render(<ToggleSwitch switchType="active_members" state={true} handleUserProfile={mockHandleUserProfile} />);
    const switchElement = screen.getByTestId('active-switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).not.toBeChecked();
  });

  it('should display error message for unknown switch type', () => {
    render(<ToggleSwitch switchType="unknown" state={false} handleUserProfile={mockHandleUserProfile} />);
    expect(screen.getByText(/ERROR: Toggle Switch./)).toBeInTheDocument();
  });
});