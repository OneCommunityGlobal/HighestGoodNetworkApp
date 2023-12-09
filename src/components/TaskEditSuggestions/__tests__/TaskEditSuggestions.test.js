import React from 'react';
import { TaskEditSuggestions } from '../TaskEditSuggestions';  
import { render, fireEvent, screen } from '@testing-library/react';
import * as reduxHooks from 'react-redux';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { toggleDateSuggestedSortDirection, toggleUserSortDirection } from '../actions';
import { waitFor } from '@testing-library/react';


describe('TaskEditSuggestions', () => {

  const initialState = {
    auth: { // Make sure this structure matches your actual Redux state
      user: {
        role: 'admin', 
      },
    },
    taskEditSuggestions: {
      isLoading: false,
      taskEditSuggestions: [
        {
          _id: '1',
          dateSuggested: '2023-01-01',
          user: 'User1',
          task: 'Task1',
          oldTask: {
            taskName: 'Old Task 1'  
          },
        },
        {
          _id: '2',
          dateSuggested: '2023-01-02',
          user: 'User2',
          task: 'Task2',
          oldTask: {
            taskName: 'Old Task 2'  // Add this object with the taskName property
          },
        },
      ],
      userSortDirection: 'asc',
      dateSuggestedSortDirection: 'asc',
    },
  };
  const mockStore = configureStore();
  let store, mockDispatch;
  
  beforeEach(() => {
    store = mockStore(initialState);
    mockDispatch = jest.fn();
    jest.spyOn(reduxHooks, 'useDispatch').mockReturnValue(mockDispatch);
    jest.spyOn(reduxHooks, 'useSelector').mockImplementation(selector => selector(store.getState()));
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with initial state', () => {
    render(
      <Provider store={store}>
        <TaskEditSuggestions />
      </Provider>
    );

    expect(screen.getByText(/Task Edit Suggestions/i)).toBeInTheDocument();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    
  });

  


  it('dispatches toggleDateSuggestedSortDirection on date header click', () => {
    render(
      <Provider store={store}>
        <TaskEditSuggestions />
      </Provider>
    );
    fireEvent.click(screen.getByText(/Date Suggested/i));
    expect(mockDispatch).toHaveBeenCalledWith(toggleDateSuggestedSortDirection());
  });

  it('dispatches toggleUserSortDirection on user header click', () => {
    render(
      <Provider store={store}>
        <TaskEditSuggestions />
      </Provider>
    );
    const userHeader = screen.getByRole('columnheader', { name: /User/i });
    fireEvent.click(userHeader);
    expect(mockDispatch).toHaveBeenCalledWith(toggleUserSortDirection());
  });


});


describe('TaskEditSuggestions loading', () => {
  const initialState = {
    auth: { 
      user: {
        role: 'admin', 
      },
    },
    taskEditSuggestions: {
      isLoading: true,
      taskEditSuggestions: [
        {
          _id: '1',
          dateSuggested: '2023-01-01',
          user: 'User1',
          task: 'Task1',
          oldTask: {
            taskName: 'Old Task 1'  
          },
        },
        {
          _id: '2',
          dateSuggested: '2023-01-02',
          user: 'User2',
          task: 'Task2',
          oldTask: {
            taskName: 'Old Task 2'  // Add this object with the taskName property
          },
        },
      ],
      userSortDirection: 'asc',
      dateSuggestedSortDirection: 'asc',
    },
  };
  const mockStore = configureStore();
  let store, mockDispatch;
  
  beforeEach(() => {
    store = mockStore(initialState);
    mockDispatch = jest.fn();
    jest.spyOn(reduxHooks, 'useDispatch').mockReturnValue(mockDispatch);
    jest.spyOn(reduxHooks, 'useSelector').mockImplementation(selector => selector(store.getState()));
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render Loading when isLoading is true', async () => {
    const testStore = mockStore({ ...initialState, taskEditSuggestions: { ...initialState.taskEditSuggestions, isLoading: true}  });
    testStore.dispatch({ type: 'FETCH_TASK_EDIT_SUGGESTIONS_BEGIN' });
    console.log(testStore.getState());
    const state = testStore.getState()
    console.log('Is Loading:', state.taskEditSuggestions.isLoading);
    render(
      <Provider store={testStore}>
        <TaskEditSuggestions />
      </Provider>
    );
    console.log('Is Loading:', state.taskEditSuggestions.isLoading);
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

});