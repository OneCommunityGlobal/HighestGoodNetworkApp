import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import DuplicateNamePopup from '../DuplicateNamePopup';

describe('DuplicateNamePopup', () => {
  const mockCreateUserProfile = jest.fn();
  const mockOnClose = jest.fn();
  const mockPopupClose = jest.fn();

  it('renders and displays modal content correctly', () => {
    const { getByText } = render(
      <DuplicateNamePopup
        open={true}
        createUserProfile={mockCreateUserProfile}
        onClose={mockOnClose}
        popupClose={mockPopupClose}
      />
    );

    expect(getByText('There is already a user with the same name.')).toBeInTheDocument();
    expect(getByText('Do you wish to proceed and have duplicate names?')).toBeInTheDocument();
    expect(getByText('Confirm')).toBeInTheDocument();
    expect(getByText('Change name')).toBeInTheDocument();
  });

  it('calls createUserProfile and onClose on confirm click', () => {
    const { getByText } = render(
      <DuplicateNamePopup
        open={true}
        createUserProfile={mockCreateUserProfile}
        onClose={mockOnClose}
        popupClose={mockPopupClose}
      />
    );

    fireEvent.click(getByText('Confirm'));

    expect(mockCreateUserProfile).toHaveBeenCalledWith(true);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls popupClose on change name click', () => {
    const { getByText } = render(
      <DuplicateNamePopup
        open={true}
        createUserProfile={mockCreateUserProfile}
        onClose={mockOnClose}
        popupClose={mockPopupClose}
      />
    );

    fireEvent.click(getByText('Change name'));

    expect(mockPopupClose).toHaveBeenCalledTimes(1);
  });

  it('calls popupClose on modal close button click', () => {
    const { getByLabelText } = render(
      <DuplicateNamePopup
        open={true}
        createUserProfile={mockCreateUserProfile}
        onClose={mockOnClose}
        popupClose={mockPopupClose}
      />
    );
  
    fireEvent.click(getByLabelText('Close'));
  
    expect(mockPopupClose).toHaveBeenCalled();
  });
});
