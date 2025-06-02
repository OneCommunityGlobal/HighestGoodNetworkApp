
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import TaskCompletedModal from '../components/TaskCompletedModal'; 

import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe('TaskCompletedModal Component', () => {
  const mockCloseFunction = vi.fn();
  const mockUpdateTask = vi.fn();
  const mockProps = {
    isOpen: true,
    setClickedToShowModal: vi.fn(),
    setCurrentUserId: vi.fn(),
    popupClose: mockCloseFunction,
    updateTask: mockUpdateTask,
    task: { _id: '1', resources: [] },
    userId: 'user123',
    taskModalOption: 'Checkmark', // or 'Remove'
  };

  it('renders without crashing', () => {
    render(<TaskCompletedModal {...mockProps} />);
  });

  it('closes the modal on button click', () => {
    render(<TaskCompletedModal {...mockProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockCloseFunction).toHaveBeenCalled();
  });

  it('handles Checkmark option correctly', () => {
    render(<TaskCompletedModal {...mockProps} />);
    const markAsDoneButton = screen.getByRole('button', { name: 'Mark as Done' });
    expect(markAsDoneButton.textContent).toBe('Mark as Done');
    fireEvent.click(markAsDoneButton);
    expect(mockUpdateTask).toHaveBeenCalled();
  });

});