import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import FoundUser from '../FoundUser';
import * as projectMembersActions from '../../../../../actions/projectMembers';

// Mock the action module
vi.mock('../../../../../actions/projectMembers', () => ({
  assignProject: vi.fn(),
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
    isActive: 'true',
    email: 'john.smith@example.com',
    assigned: false,
    projectId: 'project123',
  };

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

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
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText('1')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText('John Smith')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText('john.smith@example.com')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByRole('button')).toBeInTheDocument();
  });

  it('should render the assign button if user is not assigned', () => {
    const { getByRole } = renderUserTable(sampleUser);

    // eslint-disable-next-line testing-library/prefer-screen-queries
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
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const assignButton = queryByRole('button');
    expect(assignButton).toBeNull();
  });

  it('generates the correct user profile link', () => {
    const { getByText } = renderUserTable(sampleUser);

    // Verify that the user profile link is generated correctly
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const profileLink = getByText('John Smith');
    expect(profileLink).toHaveAttribute('href', '/userprofile/user123');
  });

  it('calls assignProject function when the assign button is clicked', async () => {
    const { getByRole } = renderUserTable(sampleUser);
    // eslint-disable-next-line testing-library/prefer-screen-queries
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
        'true',
      );
    });
  });
});
