import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import thunk from 'redux-thunk'; // Import Redux Thunk
import '@testing-library/jest-dom';
import Members from './Members';
import { authMock, rolesMock } from '../../../__tests__/mockStates';

const mockStore = configureStore([thunk]);

const renderProject= props => 
  { 
  const store = mockStore({
  auth: authMock,
  role: rolesMock.role,
  projectMembers: {
    members: [], // Provide a default value for members in the mock store
    foundUsers: [{ _id: 'member123', firstName: 'John', lastName: 'Doe', assigned: true },
    { _id: 'user2', firstName: 'Jane', lastName: 'Smith', assigned: false },],
  },
});
return render(
  <Provider store={store}>
    <Router> {/* Wrap the component in a Router */}
      <Members {...props} />
    </Router>
  </Provider>
);


};


describe('Members component', () => {
  

  it('renders without crashing', async () => {
    

    const props = {
      match: {
        params: {
          projectId: 'exampleProjectId',
        },
      },
      state: {
        projectMembers: {
          members: [],
          foundUsers: [{ _id: 'member123', firstName: 'John', lastName: 'Doe', assigned: true },
          { _id: 'user2', firstName: 'Jane', lastName: 'Smith', assigned: false },],
        },
      },
      fetchAllMembers: jest.fn(),
      findUserProfiles: jest.fn(),
      getAllUserProfiles: jest.fn(),
      assignProject: jest.fn(),
    };

    const { getByTestId, queryByText } = renderProject(props);
    
    await waitFor(() => {

      // Use getByTestId to specifically target the element with data-testid="projectId"
      const projectElement = getByTestId('projectId');
  
      // Access the text content of the element
      const projectTextContent = projectElement.textContent;
      
      // Check if the text content includes both "PROJECTS"
      expect(projectTextContent).toContain('PROJECTS');
      expect(projectTextContent).toContain('exampleProjectId');

      // Check if the "All" button is rendered
      const allButton = queryByText('All');
      expect(allButton).toBeInTheDocument();

      // Check if the "Cancel" button is rendered
      const cancelButton = queryByText('Cancel');
      expect(cancelButton).toBeInTheDocument();

    });


  });

  it('renders "All" button for all found users when clicked', async () => {
  
    const props = {
      match: {
        params: {
          projectId: 'exampleProjectId',
        },
      },
      state: {
        projectMembers: {
          members: [],
          foundUsers: [
            { _id: 'member123', firstName: 'John', lastName: 'Doe', assigned: true },
            { _id: 'user2', firstName: 'Jane', lastName: 'Smith', assigned: false },
          ],
        },
      },
      fetchAllMembers: jest.fn(),
      findUserProfiles: jest.fn(),
      getAllUserProfiles: jest.fn(),
      assignProject: jest.fn(),
    };
  
    const { getByText } = renderProject(props);
  
  
    // Check if the "All" button is rendered
    const allButton = getByText('All');
    expect(allButton).toBeInTheDocument();
    
    // Simulate a click on the "All" button
    fireEvent.click(allButton);

    // Wait for asynchronous actions triggered by the button click
    await waitFor(() => {
      const johnDoeElement = getByText('John Doe');
      expect(johnDoeElement).toBeInTheDocument();

      const janeElement = getByText('Jane Smith');
      expect(janeElement).toBeInTheDocument();


      
    });
  });

  it('hides find user list when "Cancel" button is clicked', async () => {
    const props = {
      match: {
        params: {
          projectId: 'exampleProjectId',
        },
      },
      state: {
        projectMembers: {
          members: [],
          foundUsers: [
            { _id: 'user1', firstName: 'John', lastName: 'Doe', assigned: true },
            { _id: 'user2', firstName: 'Jane', lastName: 'Smith', assigned: false },
          ],
        },
      },
      fetchAllMembers: jest.fn(),
      findUserProfiles: jest.fn(),
      getAllUserProfiles: jest.fn(),
      assignProject: jest.fn(),
    };
  
    const { getByText, queryByText } = renderProject(props);
  
    // Click the "Cancel" button
    fireEvent.click(getByText('Cancel'));
  
    // Check if the find user list is hidden
    const foundUserList = queryByText('John Doe');
    expect(foundUserList).toBeNull();
  });

  it('triggers assignProject for all found users when "Assign All" button is clicked', async () => {

    const props = {
      match: {
        params: {
          projectId: 'exampleProjectId',
        },
      },
      state: {
        projectMembers: {
          members: [],
          foundUsers: [],
        },
      },
      fetchAllMembers: jest.fn(),
      findUserProfiles: jest.fn(),
      getAllUserProfiles: jest.fn(),
      assignProject: jest.fn(),
    };
  
    const { getByText } = renderProject(props);
  
    // Click the "Assign All" button
  
    
    fireEvent.click(getByText('All'));
    fireEvent.click(getByText('+All'));

    await waitFor(()=>{
      expect(props.assignProject).toBeCalled();
    })


  });

});
