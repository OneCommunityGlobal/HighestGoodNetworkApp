import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import thunk from 'redux-thunk'; // Import Redux Thunk
import '@testing-library/jest-dom';
import Members from './Members';

describe('Members component', () => {
  const mockStore = configureStore([thunk]);

  it('renders without crashing', async () => {
    const initialState = {
      projectMembers: {
        members: [],
        foundUsers: [],
      },
      role: {
        roles: [], // Initialize roles in the state
      },
      auth: {
        user: {
          role: 'userRole', // Provide a mock user role
          permissions: {
            frontPermissions: ['permission1', 'permission2'], // Provide mock permissions if needed
          },
        },
      },
    };

    const store = mockStore(initialState);

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
      hasPermission: jest.fn(() => true),
    };

    const { getByTestId, container } = render(
      <Provider store={store}>
        <Router> {/* Wrap the component in a Router */}
          <Members {...props} />
        </Router>
      </Provider>
    );
    
    await waitFor(() => {
      // Use getByTestId to specifically target the element with data-testid="projectId"
      const projectElement = getByTestId('projectId');
  
      // Access the text content of the element
      const projectTextContent = projectElement.textContent;
      
      // Check if the text content includes both "PROJECTS"
      expect(projectTextContent).toContain('PROJECTS');
      expect(projectTextContent).toContain('exampleProjectId');
    });

  });

  it('renders member list ', async () => {
    const initialState = {
      projectMembers: {
        members: [
          {
            _id: 'member-1',
            firstName: 'John',
            lastName: 'Doe',
          },
          // Add more members as needed for your test cases
        ],
        foundUsers: [],
      },
      role: {
        roles: [],
      },
      auth: {
        user: {
          role: 'userRole',
          permissions: {
            frontPermissions: ['permission1', 'permission2'],
          },
        },
      },
    };

    const store = mockStore(initialState);

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
      hasPermission: jest.fn(() => true),
    };

    const { getByTestId } = render(
      <Provider store={store}>
        <Router>
          <Members {...props} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      // // Use a test id or other selectors to target the members in the rendered component
      // const memberJohn = getByTestId('member-member-1');
      // const memberNameJohn = getByTestId('member-name-member-1');
   

      // // Add assertions based on your component structure and test requirements
      // expect(memberJohn).toBeInTheDocument();
      // expect(memberNameJohn).toHaveTextContent('John Doe');

      // Use querySelector to find the element by class name and content
      const memberNameJohn = getByText('John Doe', { selector: 'td.members__name' });

      // Add assertions based on your component structure and test requirements
      expect(memberNameJohn).toBeInTheDocument();


    });
  });

});
