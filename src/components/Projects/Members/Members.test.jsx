import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store'; 
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import thunk from 'redux-thunk'; 
import '@testing-library/jest-dom';
import Members from './Members';
import { authMock, rolesMock } from '../../../__tests__/mockStates';

const mockStore = configureMockStore([thunk]);

const renderProject= props => { 
  const store = mockStore({
  auth: authMock,
  role: rolesMock.role,
  match: {
    params: {
      projectId: 'Project123',
    },
  },
  projectMembers: {
    members: [
      { _id: 'user1', firstName: 'John', lastName: 'Doe', isActive: true },
    ], // Provide a default value 
    foundUsers: [{
      index: 0,
      _id: 'user2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      assigned: true,
      projectId: 'project123',
    },
    {
      index: 1,
      _id: 'user3',
      firstName: 'Jay',
      lastName: 'Chao',
      email: 'jay@example.com',
      assigned: false,
      projectId: 'project123',
    }],
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
          foundUsers: [],
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
          foundUsers: [],
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
      const jayElement = getByText('jay@example.com');
      expect(jayElement).toBeInTheDocument();

      const janeElement = getByText('jane.smith@example.com');
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
          foundUsers: [],
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
    const foundUserList = queryByText('Jay Chao');
    expect(foundUserList).toBeNull();
  });

  it('toggles showActiveMembersOnly state when clicked', async () => {
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
    };

    const { getByTestId } = renderProject(props);

    // Find the toggle switch by data-testid
    const toggleSwitch = getByTestId('active-switch');

    // Initial state: showActiveMembersOnly is false
    expect(props.state.projectMembers.members.length).toBe(2); // Both members are displayed initially
    fireEvent.click(toggleSwitch);

    // After clicking the toggle switch, showActiveMembersOnly should be true
    await waitFor(() => {
      expect(props.state.projectMembers.members.length).toBe(1); // Only active member (John) should be displayed
      expect(props.fetchAllMembers).toHaveBeenCalled(); // fetchAllMembers should be called after toggling
    });
  });

  it('triggers assignProject for all found users when "Assign All" button is clicked', async () => {

    const props = { 
      match: {
        params: {
          projectId: 'project123',
        },
      },
      fetchAllMembers: jest.fn(),
      findUserProfiles: jest.fn(),
      getAllUserProfiles: jest.fn(),
      assignProject: jest.fn() 
    };
  
    const { getByText, getByRole } = renderProject(props);


    // Click the "Assign All" button
    //fireEvent.click(getByText('All'))
    fireEvent.click(getByText('+All'))
    


    await waitFor(() => {
      // Assert that assignProject is called with the expected parameters
     expect(props.assignProject).toBeCalled();
    });


  });

});
