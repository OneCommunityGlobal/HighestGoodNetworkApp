import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import AddTaskModal from '../AddTask/AddTaskModal';

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
    // Example addition if resources are distinct from project members
    availableResources: [], // List of available resources, e.g., tools, rooms, etc.
    selectedResources: [], // Resources currently assigned to the task being edited/created
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
    const { getByText, queryByText } = render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    // Assume the button to open modal is labeled 'Add Task' and opens the modal
    fireEvent.click(getByText('Add Task'));
    expect(queryByText('Add New Task')).toBeInTheDocument();
  });

  test('handles input changes for Task Name', () => {
    const { getByLabelText, getByText } = render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );

    // Open modal
    fireEvent.click(getByText('Add Task'));

    // Find the Task Name input by its label and change its value
    const input = getByLabelText('Task Name');
    fireEvent.change(input, { target: { value: 'New Important Task' } });

    // Check that the input's value updates to reflect the user's input
    expect(input.value).toBe('New Important Task');
  });
});
