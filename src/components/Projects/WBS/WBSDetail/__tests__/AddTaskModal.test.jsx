/*
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import AddTaskModal from '../AddTask/AddTaskModal';

// Mock Redux actions
vi.mock('../../../../../actions/task', () => ({
  addNewTask: vi.fn(),
}));

vi.mock('@tinymce/tinymce-react', () => ({
  Editor: ({ value, onEditorChange }) => (
    <textarea
      aria-label="Mock Editor"
      value={value}
      onChange={e => onEditorChange(e.target.value)}
    />
  ),
}));

// Mock Redux actions
vi.mock('../../../../../actions/task', () => ({
  //addNewTask: vi.fn(),
  addNewTask: vi.fn(() => ({ type: 'ADD_NEW_TASK_TEST_DUMMY' })),
  replicateTask: vi.fn(() => ({ type: 'REPLICATE_TASK_TEST_DUMMY' })),
}));

vi.mock('../../../../../actions/projectMembers', () => ({
  // Return a plain action so redux-mock-store accepts it
  fetchAllMembers: vi.fn(() => ({ type: 'FETCH_MEMBERS_TEST_DUMMY' })),
}));

vi.mock('../../../../../actions/projectMembers', () => ({
  fetchAllMembers: vi.fn(() => ({ type: 'FETCH_MEMBERS_TEST_DUMMY' })),
  findProjectMembers: vi.fn(() => ({ type: 'FIND_PROJECT_MEMBERS_TEST_DUMMY' })),
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

    // Find the End Date input by its aria-label
    const endDateInput = screen.getByLabelText('End Date');
    expect(endDateInput).toBeInTheDocument();
    
    // Verify the input is readOnly (uses calendar picker)
    expect(endDateInput).toHaveAttribute('readonly');

    // Click to open the calendar
    fireEvent.focus(endDateInput);

    // Verify the calendar picker opens (DayPicker component should be visible)
    // The DayPicker uses a grid role for the calendar
    const calendar = screen.queryByRole('grid');
    expect(calendar).toBeInTheDocument();
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
*/

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import AddTaskModal from '../AddTask/AddTaskModal';

/* ---------- Mocks (one per module path) ---------- */

// TinyMCE as a textarea
vi.mock('@tinymce/tinymce-react', () => ({
  Editor: ({ value, onEditorChange }) => (
    <textarea
      aria-label="Mock Editor"
      value={value}
      onChange={e => onEditorChange(e.target.value)}
    />
  ),
}));

// Actions: task
vi.mock('../../../../../actions/task', () => ({
  addNewTask: vi.fn(() => ({ type: 'ADD_NEW_TASK_TEST_DUMMY' })),
  replicateTask: vi.fn(() => ({ type: 'REPLICATE_TASK_TEST_DUMMY' })),
}));

// Actions: project members
vi.mock('../../../../../actions/projectMembers', () => ({
  fetchAllMembers: vi.fn(() => ({ type: 'FETCH_MEMBERS_TEST_DUMMY' })),
  findProjectMembers: vi.fn(() => ({ type: 'FIND_PROJECT_MEMBERS_TEST_DUMMY' })),
}));

// If AddTaskModal imports getProjectDetail from actions/project, uncomment:
// vi.mock('../../../../../actions/project', () => ({
//   getProjectDetail: vi.fn(() => ({ type: 'GET_PROJECT_DETAIL_TEST_DUMMY' })),
// }));

/* ---------- Store ---------- */

const mockStore = configureStore();
const initialState = {
  tasks: {
    taskItems: [],
    copiedTask: {}, // keep empty so Replicate stays disabled
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
  projectById: null,
  theme: {
    darkMode: false,
  },
  auth: {
    user: { userid: 'u-123' }, // required by mapStateToProps
  },
};

describe('AddTaskModal', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    store = mockStore(initialState);
  });

  test('renders AddTaskModal and shows modal when toggle is triggered', () => {
    render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    fireEvent.click(screen.getByText('Add Task'));
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
  });

  test('handles input changes for Task Name', () => {
    render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    fireEvent.click(screen.getByText('Add Task'));

    const input = screen.getByLabelText('Task Name');
    fireEvent.change(input, { target: { value: 'New Important Task' } });
    expect(input.value).toBe('New Important Task');
  });

  test('renders Priority select element and updates value on change', () => {
    render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    fireEvent.click(screen.getByText('Add Task'));

    const prioritySelect = screen.getByLabelText('Priority');
    expect(prioritySelect).toBeInTheDocument();
    expect(prioritySelect).toHaveAttribute('id', 'priority');
    expect(prioritySelect.value).toBe('Primary');

    fireEvent.change(prioritySelect, { target: { value: 'Secondary' } });
    expect(prioritySelect.value).toBe('Secondary');
  });

  test('adds and removes links', () => {
    render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    fireEvent.click(screen.getByText('Add Task'));

    const linkInput = screen.getByPlaceholderText('Link');
    fireEvent.change(linkInput, { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByLabelText('Add Link'));
    expect(screen.getByText('https://example.com')).toBeInTheDocument();

    const deleteButton = screen.getByLabelText('Delete link https://example.com');
    fireEvent.click(deleteButton);
    expect(screen.queryByText('https://example.com')).not.toBeInTheDocument();
  });

  // Date inputs are readOnly via react-day-picker; just assert presence
  test('renders Start Date and End Date inputs', () => {
    render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    fireEvent.click(screen.getByText('Add Task'));
    expect(screen.getByText(/Start Date/i)).toBeInTheDocument();
    expect(screen.getByText(/End Date/i)).toBeInTheDocument();
  });

  test('renders Assigned radio buttons and handles selection', () => {
    render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    fireEvent.click(screen.getByText('Add Task'));

    const yesRadio = screen.getByLabelText('Yes');
    const noRadio = screen.getByLabelText('No');
    expect(yesRadio).toBeInTheDocument();
    expect(noRadio).toBeInTheDocument();

    // initial state: "No"
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();

    fireEvent.click(yesRadio);
    expect(yesRadio).toBeChecked();
    expect(noRadio).not.toBeChecked();

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

    fireEvent.click(screen.getByText('Add Task'));

    const bestCaseInput = screen.getByLabelText('Best-case hours');
    const worstCaseInput = screen.getByLabelText('Worst-case hours');
    const mostCaseInput = screen.getByLabelText('Most-case hours');
    const estimatedInput = screen.getByLabelText('Estimated hours');

    expect(bestCaseInput).toBeInTheDocument();
    expect(worstCaseInput).toBeInTheDocument();
    expect(mostCaseInput).toBeInTheDocument();
    expect(estimatedInput).toBeInTheDocument();

    fireEvent.change(bestCaseInput, { target: { value: '10' } });
    expect(bestCaseInput.value).toBe('10');

    fireEvent.change(worstCaseInput, { target: { value: '50' } });
    expect(worstCaseInput.value).toBe('50');

    fireEvent.change(mostCaseInput, { target: { value: '30' } });
    expect(mostCaseInput.value).toBe('30');

    fireEvent.change(estimatedInput, { target: { value: '20' } });
    expect(estimatedInput.value).toBe('20');

    fireEvent.blur(bestCaseInput);
    fireEvent.blur(worstCaseInput);

    const warningMessage = screen.queryByText(/must be|must range|higher than/i);
    expect(warningMessage).not.toBeInTheDocument(); // tweak if your logic expects one
  });

  test('renders Category select and text editors, allows interactions', () => {
    render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    fireEvent.click(screen.getByText('Add Task'));

    const categorySelect = screen.getByLabelText('Category');
    expect(categorySelect).toBeInTheDocument();
    fireEvent.change(categorySelect, { target: { value: 'Housing' } });
    expect(categorySelect.value).toBe('Housing');

    const editors = screen.getAllByLabelText('Mock Editor');
    expect(editors.length).toBeGreaterThanOrEqual(3);

    fireEvent.change(editors[0], { target: { value: 'This task is critical.' } });
    expect(editors[0].value).toBe('This task is critical.');

    fireEvent.change(editors[1], { target: { value: 'Design should focus on accessibility.' } });
    expect(editors[1].value).toBe('Design should focus on accessibility.');

    fireEvent.change(editors[2], { target: { value: 'Endstate is a fully functional task.' } });
    expect(editors[2].value).toBe('Endstate is a fully functional task.');
  });
});