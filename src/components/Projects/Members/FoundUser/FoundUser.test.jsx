import React from 'react';
import { render, fireEvent, getByTestId, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux'; 
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import FoundUser from './FoundUser';

const mockStore = configureMockStore([thunk]);

describe('FoundUser Component', () => {
  const sampleUser = {
    index: 0,
    uid: 'user123',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    assigned: false,
    projectId: 'project123',
  };

  it('renders user data correctly', () => {
    const initialState = {}; 
    const store = mockStore(initialState);

    const { getByText, getByRole } = render(
      <Provider store={store}> 
        <FoundUser {...sampleUser} />
      </Provider>
    );
    
    // Verify that user data is displayed correctly
    expect(getByText('1')).toBeInTheDocument();
    expect(getByText('John Smith')).toBeInTheDocument();
    expect(getByText('john.smith@example.com')).toBeInTheDocument();
    expect(getByRole('button')).toBeInTheDocument();
  });

  it('should render the assign button if user is not assigned', () => {

    const initialState = {};
    const store = mockStore(initialState);

    const { getByRole } = render(
      <Provider store={store}>
        <FoundUser {...sampleUser} />
      </Provider>
    );
    
    const assignButton = getByRole('button');
    expect(assignButton).toBeInTheDocument();
  });


  it('should not render the assign button if user is already assigned', () => {
    const assignedUser = {
      ...sampleUser,
      assigned: true,
    }

    const initialState = {};
    const store = mockStore(initialState);

    const { queryByRole } = render(
      <Provider store={store}>
        <FoundUser {...assignedUser} />
      </Provider>
    );

    //verify that button is not rendered
    const assignButton = queryByRole('button');
    expect(assignButton).toBeNull();
  });

  it('generates the correct user profile link', () => {


    const initialState = {};
    const store = mockStore(initialState);

    const { getByText } = render(
      <Provider store={store}>
        <FoundUser {...sampleUser} />
      </Provider>
    );
    
    // Verify that the user profile link is generated correctly
    const profileLink = getByText('John Smith');
    expect(profileLink).toHaveAttribute('href', '/userprofile/user123');
  });

    it('calls assignProject function when the assign button is clicked', () => {

    const assignProject = jest.fn();
     
    const initialState = {};
    const store = mockStore(initialState);

    const { getByRole } = render(
      <Provider store={store}>
        <FoundUser {...sampleUser} assignProject={assignProject} />
      </Provider>
    );
    const assignButton = getByRole('button');

    // Simulate a button click
    fireEvent.click(assignButton);

      waitFor(() => {
        expect(assignProject).toBeCalled();
      });
      // Verify that the assignProject function is called with the expected arguments
      waitFor(() => {
        expect(assignProject).toHaveBeenCalledWith(
          'project123',
          'user123',
          'Assign',
          'John',
          'Smith'
        );
      });       
  });
});
