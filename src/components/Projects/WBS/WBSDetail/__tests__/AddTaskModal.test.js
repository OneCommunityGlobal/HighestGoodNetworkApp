import React from 'react';
import { Provider } from 'react-redux';
import { render, fireEvent } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';
import AddTaskModal from '../AddTask/AddTaskModal';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('AddTaskModal', () => {
  let store;
  let component;

  beforeEach(() => {
    store = mockStore({
      tasks: { taskItems: [], copiedTask: null, error: null },
      projectMembers: { members: [] },
      allProjects: {},
      theme: { darkMode: false },
    });

    component = render(
      <Provider store={store}>
        <AddTaskModal />
      </Provider>,
    );
  });

  it('renders correctly', () => {
    expect(component.getByText('Add Task')).toBeInTheDocument();
  });

  it('opens modal on button click', () => {
    fireEvent.click(component.getByText('Add Task'));
    expect(component.getByText('Add New Task')).toBeInTheDocument();
  });

  it('checks modal content', () => {
    fireEvent.click(component.getByText('Add Task'));
  });

  it('allows input and interacts with form fields', () => {
    fireEvent.click(component.getByText('Add Task')); // Open modal
    fireEvent.change(component.getByLabelText('Task Name'), { target: { value: 'New Task' } });
    fireEvent.change(component.getByDisplayValue('Primary'), { target: { value: 'Secondary' } }); // Change priority
    fireEvent.click(component.getByLabelText('Active')); // Select a status

    expect(component.getByLabelText('Task Name').value).toBe('New Task');
    expect(component.getByDisplayValue('Secondary').selected).toBeTruthy();
    expect(component.getByLabelText('Active').checked).toBeTruthy();
  });
  it('validates input fields before submitting', () => {
    fireEvent.click(component.getByText('Add Task')); // Open modal
    const saveButton = component.getByText('Save');
    fireEvent.click(saveButton);

    // Assuming there is a way to check error messages in your UI
    expect(component.queryByText('Task name is required')).toBeInTheDocument();
  });

  it('submits the form and dispatches an action', () => {
    fireEvent.click(component.getByText('Add Task')); // To open the modal
    const input = component.getByLabelText('Task Name');
    fireEvent.change(input, { target: { value: 'New Task' } });

    fireEvent.click(component.getByText('Save'));
    const actions = store.getActions();
    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'ADD_NEW_TASK',
        }),
      ]),
    );
  });
});
