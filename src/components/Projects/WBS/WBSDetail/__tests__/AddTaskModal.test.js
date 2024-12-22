import React from 'react';
import { Provider } from 'react-redux';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import AddTaskModal from '../AddTask/AddTaskModal'; // Adjust the import path as necessary

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// Mock the initial state
const initialState = {
    tasks: {
        taskItems: [],
        copiedTask: {},
        error: null
    },
    projectMembers: {
        members: []
    },
    allProjects: {
        projects: []
    },
    theme: {
        darkMode: false
    }
};

// Utility function to render the component with all providers
const renderComponent = (store) => render(
    <Provider store={store}>
        <Router>
            <AddTaskModal />
        </Router>
    </Provider>
);

describe('AddTaskModal', () => {
    let store;

    beforeEach(() => {
        store = mockStore(initialState);
    });

    test('renders AddTaskModal and shows modal when toggle is triggered', () => {
      const { getByText, queryByText } = renderComponent(store);
      
      // Ensure the button that triggers the modal is present and click it
      const openButton = getByText(/Add Task/i);
      fireEvent.click(openButton);
  
      // Wait for the modal text to be present
      const modalTitle = queryByText(/Add New Task/i);
      expect(modalTitle).toBeInTheDocument();
  });
  
  
  test('handles input changes for Task Name', () => {
    const { getByLabelText, getByText } = render(
        <Provider store={store}>
            <AddTaskModal />
      </Provider>,
    );
    
    // Uncomment the next line if the modal needs to be manually opened
    // fireEvent.click(getByText('Add Task'));

    const input = getByLabelText('Task Name');
    fireEvent.change(input, { target: { value: 'New Important Task' } });
    
    expect(input.value).toBe('New Important Task');
});



    // Additional tests for form interactions, button clicks, and Redux actions
});

