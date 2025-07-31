import { render, fireEvent, screen } from '@testing-library/react';
import TaskCompletedModal from '../components/TaskCompletedModal';

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
  },
}));

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

describe('TaskCompletedModal Component', () => {
  const mockCloseFunction = jest.fn();
  const mockUpdateTask = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TaskCompletedModal
        isOpen
        setClickedToShowModal={jest.fn()}
        setCurrentUserId={jest.fn()}
        popupClose={mockCloseFunction}
        updateTask={mockUpdateTask}
        task={{ _id: '1', resources: [] }}
        userId="user123"
        taskModalOption="Checkmark" // or 'Remove'
      />,
    );
  });

  it('closes the modal on button click', () => {
    render(
      <TaskCompletedModal
        isOpen
        setClickedToShowModal={jest.fn()}
        setCurrentUserId={jest.fn()}
        popupClose={mockCloseFunction}
        updateTask={mockUpdateTask}
        task={{ _id: '1', resources: [] }}
        userId="user123"
        taskModalOption="Checkmark" // or 'Remove'
      />,
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockCloseFunction).toHaveBeenCalled();
  });

  it('handles Checkmark option correctly', () => {
    render(
      <TaskCompletedModal
        isOpen
        setClickedToShowModal={jest.fn()}
        setCurrentUserId={jest.fn()}
        popupClose={mockCloseFunction}
        updateTask={mockUpdateTask}
        task={{ _id: '1', resources: [] }}
        userId="user123"
        taskModalOption="Checkmark" // or 'Remove'
      />,
    );
    const markAsDoneButton = screen.getByRole('button', { name: 'Mark as Done' });
    expect(markAsDoneButton.textContent).toBe('Mark as Done');
    fireEvent.click(markAsDoneButton);
    expect(mockUpdateTask).toHaveBeenCalled();
  });
});
