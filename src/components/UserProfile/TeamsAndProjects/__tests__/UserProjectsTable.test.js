import { Provider } from 'react-redux';
import UserProjectsTable from '../UserProjectsTable';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { render, screen, within } from '@testing-library/react';
import { userProfileMock } from '../../../../__tests__/mockStates.js';

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

const userTaskMock = [
  {
    "priority": "Primary",
    "isAssigned": true,
    "status": "Complete",
    "_id": "6470477897eefd0a38475112",
    "resources": [
        {
            "completedTask": true,
            "reviewStatus": "Unsubmitted",
            "_id": "6470477897eefd0a38475113",
            "userID": "645325bea0067106d4423119",
        },
        {
            "completedTask": true,
            "reviewStatus": "Unsubmitted",
            "_id": "64751f5009107205627746fb",
            "userID": "6453268aa0067106d4423160",
        }
    ],
    "wbsId": "6470473f97eefd0a38475104",
    "taskName": "Task 1",
    "num": "1",
    "category": "Food",
    "projectId": "1"
},
{
    "priority": "Primary",
    "isAssigned": false,
    "status": "Active",
    "isActive": true,
    "_id": "64b6f347d34321075b7734fe",
    "resources": [
        {
            "completedTask": false,
            "reviewStatus": "Unsubmitted",
            "_id": "64b6f347d34321075b773531",
            "name": "User 1",
            "userID": "6453266da0067106d4423158"
        },
        {
            "completedTask": false,
            "reviewStatus": "Unsubmitted",
            "_id": "64b6f347d34321075b773532",
            "name": "User 2",
            "userID": "6453268aa0067106d4423160"
        }
    ],
    "wbsId": "64b6f33cd34321075b7734de",
    "taskName": "Task 2",
    "num": "2.1.1.0",
    "projectId": "2"
},
]

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
        userTasks={mockProps.userTasks}
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

  // Test for correct number of tasks per project displayed
  it('renders correct number of tasks', () => {
    mockUserProfile.userTasks = userTaskMock;
    renderComponent(mockUserProfile);
    const taskRows = within(screen.getByTestId('userProjectTaskTest')).getAllByRole('row'); 
    expect(taskRows.length).toBe(2); // Ensure we have 2 task rows
  });
});