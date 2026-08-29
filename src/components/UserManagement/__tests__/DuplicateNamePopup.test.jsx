// import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import DuplicateNamePopup from '../DuplicateNamePopup';

describe('DuplicateNamePopup', () => {
  const mockCreateUserProfile = vi.fn();
  const mockOnClose = vi.fn();
  const mockPopupClose = vi.fn();

  it('renders and displays modal content correctly', () => {
    const { getByText } = render(
      <DuplicateNamePopup
        open
        createUserProfile={mockCreateUserProfile}
        onClose={mockOnClose}
        popupClose={mockPopupClose}
      />,
    );

    expect(screen.getByText('There is already a user with the same name.')).toBeInTheDocument();
    expect(screen.getByText('Do you wish to proceed and have duplicate names?')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Change name')).toBeInTheDocument();
  });

  it('calls createUserProfile and onClose on confirm click', () => {
    const { getByText } = render(
      <DuplicateNamePopup
        open
        createUserProfile={mockCreateUserProfile}
        onClose={mockOnClose}
        popupClose={mockPopupClose}
      />,
    );

    fireEvent.click(screen.getByText('Confirm'));

    expect(mockCreateUserProfile).toHaveBeenCalledWith(true);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls popupClose on change name click', () => {
    const { getByText } = render(
      <DuplicateNamePopup
        open
        createUserProfile={mockCreateUserProfile}
        onClose={mockOnClose}
        popupClose={mockPopupClose}
      />,
    );

    fireEvent.click(screen.getByText('Change name'));

    expect(mockPopupClose).toHaveBeenCalledTimes(1);
  });

  it('calls popupClose on modal close button click', () => {
    const { getByLabelText } = render(
      <DuplicateNamePopup
        open
        createUserProfile={mockCreateUserProfile}
        onClose={mockOnClose}
        popupClose={mockPopupClose}
      />,
    );

    fireEvent.click(screen.getByLabelText('Close'));

    expect(mockPopupClose).toHaveBeenCalled();
  });
});
