import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import FoundUser from '../FoundUser';
import * as projectMembersActions from '../../../../../actions/projectMembers';

// Mock the action module
jest.mock('../../../../../actions/projectMembers', () => ({
  assignProject: jest.fn(),
}));

const mockStore = configureMockStore([thunk]);

const renderUserTable = user => {
  const initialState = {};
  const store = mockStore(initialState);

  return render(
    <Provider store={store}>
      <table>
        <tbody>
          <FoundUser {...user} />
        </tbody>
      </table>
    </Provider>,
  );
};

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

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock the assignProject action to return a thunk function that returns a resolved promise
    projectMembersActions.assignProject.mockImplementation(() => {
      return () => {
        // Return a resolved promise to prevent the .then() error
        return Promise.resolve({ data: 'success' });
      };
    });
  });

  it('renders user data correctly', () => {
    const { getByText, getByRole } = renderUserTable(sampleUser);

    // Verify that user data is displayed correctly
    expect(getByText('1')).toBeInTheDocument();
    expect(getByText('John Smith')).toBeInTheDocument();
    expect(getByText('john.smith@example.com')).toBeInTheDocument();
    expect(getByRole('button')).toBeInTheDocument();
  });

  it('should render the assign button if user is not assigned', () => {
    const { getByRole } = renderUserTable(sampleUser);

    const assignButton = getByRole('button');
    expect(assignButton).toBeInTheDocument();
  });

  it('should not render the assign button if user is already assigned', () => {
    const assignedUser = {
      ...sampleUser,
      assigned: true,
    };

    const { queryByRole } = renderUserTable(assignedUser);

    // verify that button is not rendered
    const assignButton = queryByRole('button');
    expect(assignButton).toBeNull();
  });

  it('generates the correct user profile link', () => {
    const { getByText } = renderUserTable(sampleUser);

    // Verify that the user profile link is generated correctly
    const profileLink = getByText('John Smith');
    expect(profileLink).toHaveAttribute('href', '/userprofile/user123');
  });

  it('calls assignProject function when the assign button is clicked', async () => {
    const { getByRole } = renderUserTable(sampleUser);
    const assignButton = getByRole('button');

    // Simulate a button click
    fireEvent.click(assignButton);

    await waitFor(() => {
      expect(projectMembersActions.assignProject).toHaveBeenCalled();
    });

    // Verify that the assignProject function is called with the expected arguments
    await waitFor(() => {
      expect(projectMembersActions.assignProject).toHaveBeenCalledWith(
        'project123',
        'user123',
        'Assign',
        'John',
        'Smith',
      );
    });
  });
});
