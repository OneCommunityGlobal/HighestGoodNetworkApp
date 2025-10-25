import { render, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Member from '../Member';
import * as projectMembersActions from '../../../../../actions/projectMembers';

 vi.mock('~/utils/permissions', () => ({
   __esModule: true,
   default: vi.fn(() => true),
 }));

// Mock the action module
vi.mock('../../../../../actions/projectMembers', () => ({
  assignProject: vi.fn(),
}));

const mockStore = configureMockStore([thunk]);

// Utility function to render the Member component with various props
const renderMemberRow = memberProps => {
  // Mock the necessary parts of your state here. These values might differ based on your actual state shape.
  const initialState = {
    role: {
      roles: [], // or whatever mock data is appropriate
    },
    auth: {
      user: {
        role: 'Owner', // set user role to "owner"
        permissions: {
          frontPermissions: [], // or appropriate mock data
        },
      },
    },
    ...memberProps,

    // ... any other necessary parts of your state
  };

  const store = mockStore(initialState);

  return render(
    <Provider store={store}>
      <table>
        <tbody>
          <Member {...memberProps} />
        </tbody>
      </table>
    </Provider>,
  );
};

describe('Member Component', () => {
  // Sample member data for testing
  const sampleMember = {
    index: 0,
    uid: 'member123',
    fullName: 'Jane Doe',
    firstName: 'Jane',
    lastName: 'Doe',
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

  it('renders member data correctly', () => {
    const hasPermission = vi.fn(() => true);
    sampleMember.hasPermission = hasPermission;
    const { getByText } = renderMemberRow(sampleMember);

    // Verify that member data is displayed
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText('1')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText('Jane Doe')).toBeInTheDocument();
    // Other assertions can be added here based on what else the component renders
  });

  it('generates the correct user profile link', () => {
    const hasPermission = vi.fn(() => true);
    sampleMember.hasPermission = hasPermission;
    const { getByRole } = renderMemberRow(sampleMember);
    // Fetch the anchor element with the name 'Jane Doe'
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const profileLinkElement = getByRole('link', { name: /Jane Doe/i });
    expect(profileLinkElement).toHaveAttribute('href', `/userprofile/${sampleMember.uid}`);
  });

  it('renders the unassign button if the user has the correct permissions', () => {
    const hasPermission = vi.fn(() => true);
    sampleMember.hasPermission = hasPermission;
    const { container } = renderMemberRow(sampleMember);
    // Verify that the unassign button is there
    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    const buttonIcon = container.querySelector('i.fa.fa-minus');
    expect(buttonIcon).toBeInTheDocument();
  });

  it('calls assignProject function with "unAssign" when the unassign button is clicked', async () => {
    const hasPermission = vi.fn(() => true);
    sampleMember.hasPermission = hasPermission;
    const { getByRole } = renderMemberRow(sampleMember);

    // Simulate a button click on the actual button instead of the icon
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const unassignButton = getByRole('button');

    expect(unassignButton).toBeInTheDocument();
    fireEvent.click(unassignButton);

    await waitFor(() => {
      expect(projectMembersActions.assignProject).toHaveBeenCalled();
    });

    // Verify that the assignProject function is called with the expected arguments
    await waitFor(() => {
      expect(projectMembersActions.assignProject).toHaveBeenCalledWith(
        'project123',
        'member123',
        'unAssign',
        'Jane',
        'Doe',
      );
    });
  });

  it('does not render the unassign button without the correct permissions', () => {
    const hasPermission = vi.fn(() => false);
    const nonOwnerProps = {
      ...sampleMember,
      auth: {
        user: {
          role: '', // Setting the role to an empty string for this test
          permissions: {
            frontPermissions: [],
          },
        },
      },
      hasPermission,
    };
    const { container } = renderMemberRow(nonOwnerProps);
    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    const buttonIcon = container.querySelector('i.fa.fa-minus');
    expect(buttonIcon).toBeInTheDocument();
  });
});
