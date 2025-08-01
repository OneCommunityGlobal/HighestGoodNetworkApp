import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { TaskEditSuggestionRow } from '../TaskEditSuggestionRow';

// Mock the `datetimeToDate` function
vi.mock('~/components/TeamMemberTasks/components/TaskDifferenceModal', () => ({
  datetimeToDate: () => 'Mocked Date',
}));

describe('TaskEditSuggestionRow', () => {
  const mockHandleToggle = vi.fn();
  const taskEditSuggestionMock = {
    dateSuggested: new Date().toString(),
    user: 'test-user',
    oldTask: { taskName: 'Old Task Name' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the task edit suggestion information', () => {
    render(
      <TaskEditSuggestionRow
        taskEditSuggestion={taskEditSuggestionMock}
        handleToggleTaskEditSuggestionModal={mockHandleToggle}
      />,
    );

    expect(screen.getByText('Mocked Date')).toBeInTheDocument();
    expect(screen.getByText(taskEditSuggestionMock.user)).toBeInTheDocument();
    expect(screen.getByText(taskEditSuggestionMock.oldTask.taskName)).toBeInTheDocument();
  });

  it('calls handleToggleTaskEditSuggestionModal with taskEditSuggestion data when the row is clicked', () => {
    render(
      <TaskEditSuggestionRow
        taskEditSuggestion={taskEditSuggestionMock}
        handleToggleTaskEditSuggestionModal={mockHandleToggle}
      />,
    );

    fireEvent.click(screen.getByRole('row'));
    expect(mockHandleToggle).toHaveBeenCalledWith(taskEditSuggestionMock);
  });

  it('calls handleToggleTaskEditSuggestionModal with taskEditSuggestion data when the button is clicked', () => {
    render(
      <TaskEditSuggestionRow
        taskEditSuggestion={taskEditSuggestionMock}
        handleToggleTaskEditSuggestionModal={mockHandleToggle}
      />,
    );

    fireEvent.click(screen.getByText('View Suggestion'));
    expect(mockHandleToggle).toHaveBeenCalledWith(taskEditSuggestionMock);
    // Verify the click does not propagate to the row
    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
  });

  it('prevents event propagation when the button is clicked', async () => {
    const mockParentHandler = vi.fn();

    render(
      <div onClick={mockParentHandler} role="button" tabIndex={0} onKeyDown={() => {}}>
        <TaskEditSuggestionRow
          taskEditSuggestion={taskEditSuggestionMock}
          handleToggleTaskEditSuggestionModal={mockHandleToggle}
        />
      </div>,
    );

    const button = screen.getByText('View Suggestion');
    await userEvent.click(button);

    expect(mockParentHandler).not.toHaveBeenCalled();
    expect(mockHandleToggle).toHaveBeenCalledWith(taskEditSuggestionMock);
  });

  it('applies inline styles to the button', () => {
    render(
      <TaskEditSuggestionRow
        taskEditSuggestion={taskEditSuggestionMock}
        handleToggleTaskEditSuggestionModal={mockHandleToggle}
      />,
    );

    const button = screen.getByText('View Suggestion');
    expect(button).toHaveStyle({
      backgroundColor: '#007bff',
      borderRadius: '5px',
      padding: '5px 10px',
      color: 'rgb(255, 255, 255)',
    });
  });

  it('updates when taskEditSuggestion prop changes', () => {
    const { rerender } = render(
      <TaskEditSuggestionRow
        taskEditSuggestion={taskEditSuggestionMock}
        handleToggleTaskEditSuggestionModal={mockHandleToggle}
      />,
    );

    const newTaskEditSuggestion = {
      dateSuggested: new Date(2023, 1, 1).toString(),
      user: 'new-user',
      oldTask: { taskName: 'New Task' },
    };

    rerender(
      <TaskEditSuggestionRow
        taskEditSuggestion={newTaskEditSuggestion}
        handleToggleTaskEditSuggestionModal={mockHandleToggle}
      />,
    );

    expect(screen.getByText('new-user')).toBeInTheDocument();
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });
});
