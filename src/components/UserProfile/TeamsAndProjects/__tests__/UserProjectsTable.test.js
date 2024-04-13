import { Provider } from 'react-redux';
import UserProjectsTable from '../UserProjectsTable';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { render, screen, within } from '@testing-library/react';
import { userProfileMock, userTaskMock } from '../../../../__tests__/mockStates.js';

jest.mock('utils/permissions', () => ({
  hasPermission: jest.fn((a) => true),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    pathname: "localhost:3000/userprofile/1"
  })
}));

const mockStore = configureStore([thunk]);

const mockUserProfile = {
  userProjects: [
  { _id: '1', category: 'Society', projectName: 'Project1' },
  { _id: '2', category: 'Test', projectName: 'Project2' }
],
userProfile: userProfileMock,
userTasks: []
};


const renderComponent = mockProps => {
  const store = mockStore({
    auth: {
      user: {
        role: 'Owner', 
        permissions: {
          frontPermissions: [],
        },
      },
    },
      disabled: false,
      edit: true,
      role: "Administrator",
      userProfile: {
       ...mockProps.userProfile,
      },
      hasPermission: jest.fn((a) => true),
      userTasks: []
  });

  return render(
    <Provider store={store}>
      <UserProjectsTable
        userProjectsById={mockProps.userProjects}
        renderedOn={Date.now()}
        edit={mockProps.edit}
        role={mockProps.role}
        disabled={mockProps.disabled}
        userId={mockProps.userProfile._id}
        hasPermission={jest.fn((a) => true)}
        userTasks={[]}
      />
    </Provider>,
  );
};


describe('User Projects Table Component', () => {
  it('render without crashing', () => {
    renderComponent(mockUserProfile);

  });

  it('renders correct number of projects the user is assigned to', () => {
    renderComponent(mockUserProfile);
    expect(within(screen.getByTestId('userProjectTest')).getAllByRole('row').length).toBe(2);
  });

  // Test for correct rendering of project names
  it('renders correct project names', () => {
    renderComponent(mockUserProfile);
    const projectRows = within(screen.getByTestId('userProjectTest')).getAllByRole('row'); 
    expect(projectRows.length).toBe(2); // Ensure we have 2 project rows

    const projectNames = projectRows.map(row => {
      return row.cells[1].textContent;
    });
    expect(projectNames).toEqual(['Project1', 'Project2']);
  });
});