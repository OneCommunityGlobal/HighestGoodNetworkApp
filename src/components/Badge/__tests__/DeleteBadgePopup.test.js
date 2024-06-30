import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteBadgePopup from '../DeleteBadgePopup';

describe('DeleteBadgePopup component', () => {
  const mockProps = {
    open: true,
    setDeletePopup: jest.fn(),
    deleteBadge: jest.fn(),
    badgeId: 'mockBadgeId',
    badgeName: 'Mock Badge',
  };

  beforeEach(() => {
    render(<DeleteBadgePopup {...mockProps} />);
  });

  test('renders DeleteBadgePopup component', () => {
    expect(screen.getByText('Confirm Delete Badge')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete this badge/i)).toBeInTheDocument();
    expect(screen.getByText(/badge name: mock badge/i)).toBeInTheDocument();
    expect(screen.getByText(/consider your next move carefully/i)).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('calls setDeletePopup when Cancel button is clicked', () => {
    fireEvent.click(screen.getByText('Cancel'));

    expect(mockProps.setDeletePopup).toHaveBeenCalledWith(false);
  });

  test('calls deleteBadge and setDeletePopup when Delete button is clicked', () => {
    fireEvent.click(screen.getByText('Delete'));

    expect(mockProps.deleteBadge).toHaveBeenCalledWith('mockBadgeId');
    expect(mockProps.setDeletePopup).toHaveBeenCalledWith(false);
  });

  // Add more test cases based on the component's functionality
});
