import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import AddTaskModal from '../AddTask/AddTaskModal';

// Mock Redux actions
jest.mock('../../../../../actions/task', () => ({
  addNewTask: jest.fn(),
}));

jest.mock('@tinymce/tinymce-react', () => ({
  Editor: ({ value, onEditorChange }) => (
    <textarea
      aria-label="Mock Editor"
      value={value}
      onChange={e => onEditorChange(e.target.value)}
    />
  ),
}));

const mockStore = configureStore();
const initialState = {
  tasks: {
    taskItems: [],
    copiedTask: {},
    error: null,
  },
  projectMembers: {
    members: [],
    allMembers: [],
  },
  resources: {
    availableResources: [],
    selectedResources: [],
  },
  allProjects: {
    projects: [],
  },
  theme: {
    darkMode: false,
  },
};

describe('AddTaskModal', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  test('renders AddTaskModal and shows modal when toggle is triggered', () => {
    render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    // Open the modal
    fireEvent.click(screen.getByText('Add Task'));

    // Check that the modal is displayed
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
  });

  test('handles input changes for Task Name', () => {
    render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    // Open the modal
    fireEvent.click(screen.getByText('Add Task'));

    // Find the Task Name input and simulate user input
    const input = screen.getByLabelText('Task Name');
    fireEvent.change(input, { target: { value: 'New Important Task' } });

    // Verify the input value is updated
    expect(input.value).toBe('New Important Task');
  });

  test('renders Priority select element and updates value on change', () => {
    render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    // Open the modal
    fireEvent.click(screen.getByText('Add Task'));

    // Check the select element exists with the label "Priority"
    const prioritySelect = screen.getByLabelText('Priority');
    expect(prioritySelect).toBeInTheDocument();
    expect(prioritySelect).toHaveAttribute('id', 'priority');

    // Check default value
    expect(prioritySelect.value).toBe('Primary');

    // Simulate a change to the select element
    fireEvent.change(prioritySelect, { target: { value: 'Secondary' } });
    expect(prioritySelect.value).toBe('Secondary');
  });

  test('adds and removes links', () => {
    render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    // Open the modal
    fireEvent.click(screen.getByText('Add Task'));

    // Add a link
    const linkInput = screen.getByPlaceholderText('Link');
    fireEvent.change(linkInput, { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByLabelText('Add Link'));

    // Verify the link appears in the modal
    expect(screen.getByText('https://example.com')).toBeInTheDocument();

    // Remove the link
    const deleteButton = screen.getByLabelText('Delete link https://example.com');
    fireEvent.click(deleteButton);

    // Verify the link is removed
    expect(screen.queryByText('https://example.com')).not.toBeInTheDocument();
  });

  test('renders End Date input and handles date change', () => {
    render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    // Open the modal
    fireEvent.click(screen.getByText('Add Task'));

    // Verify the "End Date" label is rendered
    expect(screen.getByText(/End Date/i)).toBeInTheDocument();

    // Find the DayPickerInput by its role (textbox)
    const endDateInput = screen.getByRole('textbox', { name: /End Date/i }); // Use accessible label
    expect(endDateInput).toBeInTheDocument();

    // Simulate a date change
    fireEvent.change(endDateInput, { target: { value: '12/25/24' } });

    // Verify the input value updates
    expect(endDateInput.value).toBe('12/25/24');
  });
  test('renders Assigned radio buttons and handles selection', () => {
    render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    // Open the modal
    fireEvent.click(screen.getByText('Add Task'));

    // Verify both radio buttons are rendered
    const yesRadio = screen.getByLabelText('Yes');
    const noRadio = screen.getByLabelText('No');
    expect(yesRadio).toBeInTheDocument();
    expect(noRadio).toBeInTheDocument();

    // Check initial state (assuming it's false)
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();

    // Simulate selecting "Yes"
    fireEvent.click(yesRadio);
    expect(yesRadio).toBeChecked();
    expect(noRadio).not.toBeChecked();

    // Simulate selecting "No"
    fireEvent.click(noRadio);
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();
  });
  test('renders Hours inputs and validates their behavior', () => {
    render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    // Open the modal
    fireEvent.click(screen.getByText('Add Task'));

    // Verify all hour inputs are rendered
    const bestCaseInput = screen.getByLabelText('Best-case hours');
    const worstCaseInput = screen.getByLabelText('Worst-case hours');
    const mostCaseInput = screen.getByLabelText('Most-case hours');
    const estimatedInput = screen.getByLabelText('Estimated hours');

    expect(bestCaseInput).toBeInTheDocument();
    expect(worstCaseInput).toBeInTheDocument();
    expect(mostCaseInput).toBeInTheDocument();
    expect(estimatedInput).toBeInTheDocument();

    // Simulate input changes and validate updates
    fireEvent.change(bestCaseInput, { target: { value: '10' } });
    expect(bestCaseInput.value).toBe('10');

    fireEvent.change(worstCaseInput, { target: { value: '50' } });
    expect(worstCaseInput.value).toBe('50');

    fireEvent.change(mostCaseInput, { target: { value: '30' } });
    expect(mostCaseInput.value).toBe('30');

    fireEvent.change(estimatedInput, { target: { value: '20' } });
    expect(estimatedInput.value).toBe('20');

    // Simulate blur event to trigger validation
    fireEvent.blur(bestCaseInput);
    fireEvent.blur(worstCaseInput);

    // Verify warnings (if any) are displayed
    const warningMessage = screen.queryByText(/must be/i);
    expect(warningMessage).not.toBeInTheDocument(); // Adjust if warning expected based on logic
  });
  test('renders Category select and text editors, allows interactions', () => {
    render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    // Open the modal
    fireEvent.click(screen.getByText('Add Task'));

    // Test Category dropdown
    const categorySelect = screen.getByLabelText('Category');
    expect(categorySelect).toBeInTheDocument();

    fireEvent.change(categorySelect, { target: { value: 'Housing' } });
    expect(categorySelect.value).toBe('Housing');

    // Test "Why this Task is Important" editor
    const editors = screen.getAllByLabelText('Mock Editor'); // Get all editors
    expect(editors.length).toBeGreaterThanOrEqual(3); // Ensure there are at least 3 editors

    // Interact with the first editor
    const whyTaskEditor = editors[0];
    fireEvent.change(whyTaskEditor, { target: { value: 'This task is critical.' } });
    expect(whyTaskEditor.value).toBe('This task is critical.');

    // Interact with the second editor ("Design Intent")
    const designIntentEditor = editors[1];
    fireEvent.change(designIntentEditor, {
      target: { value: 'Design should focus on accessibility.' },
    });
    expect(designIntentEditor.value).toBe('Design should focus on accessibility.');

    // Interact with the third editor ("Endstate")
    const endstateEditor = editors[2];
    fireEvent.change(endstateEditor, { target: { value: 'Endstate is a fully functional task.' } });
    expect(endstateEditor.value).toBe('Endstate is a fully functional task.');
  });
});
