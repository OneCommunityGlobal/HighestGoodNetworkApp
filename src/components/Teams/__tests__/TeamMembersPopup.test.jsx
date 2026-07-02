import { configureStore } from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import TeamMembersPopup from '~/components/Teams/TeamMembersPopup';
import { authMock, userProfileMock, rolesMock, themeMock } from '../../../__tests__/mockStates';

const mockStore = configureStore([thunk]);

const mockOnClose = vi.fn();
const mockOnDeleteClick = vi.fn();
const mockHasPermission = vi.fn(() => true);

const usersdata = {
  userProfiles: [
    {
      _id: 'user1',
      firstName: 'Alice',
      lastName: 'Smith',
      role: 'Manager',
      addDateTime: new Date().toISOString(),
      isActive: true,
      isVisible: true,
    },
  ],
};

const teamMembers = [
  {
    _id: 'user1',
    firstName: 'Alice',
    lastName: 'Smith',
    role: 'Manager',
    addDateTime: new Date().toISOString(),
    isActive: true,
    isVisible: true,
  },
];

const initialProps = {
  open: true,
  selectedTeamName: 'Test Team',
  hasPermission: mockHasPermission,
  members: {
    teamMembers,
    reduce: vi.fn(() => {}),
  },
  roles: [{}],
  auth: {
    user: {
      role: 'Owner',
      permissions: {
        frontPermissions: ['assignTeamToUsers'],
      },
    },
  },
  userProfile: { userProfiles: usersdata.userProfiles },
  requestorRole: '',
  userPermissions: [],
  onClose: mockOnClose,
  onDeleteClick: mockOnDeleteClick,
  usersdata,
  onAddUser: vi.fn(),
  onUpdateTeamMemberVisibility: vi.fn(),
};

const renderComponent = (overrideProps = {}) => {
  const store = mockStore({
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
    theme: themeMock,
  });

  return render(
    <Provider store={store}>
      <TeamMembersPopup
        open={overrideProps.open ?? initialProps.open}
        selectedTeamName={overrideProps.selectedTeamName ?? initialProps.selectedTeamName}
        hasPermission={overrideProps.hasPermission ?? initialProps.hasPermission}
        members={overrideProps.members ?? initialProps.members}
        roles={overrideProps.roles ?? initialProps.roles}
        auth={overrideProps.auth ?? initialProps.auth}
        userProfile={overrideProps.userProfile ?? initialProps.userProfile}
        requestorRole={overrideProps.requestorRole ?? initialProps.requestorRole}
        userPermissions={overrideProps.userPermissions ?? initialProps.userPermissions}
        onClose={overrideProps.onClose ?? initialProps.onClose}
        onDeleteClick={overrideProps.onDeleteClick ?? initialProps.onDeleteClick}
        usersdata={overrideProps.usersdata ?? initialProps.usersdata}
        onAddUser={overrideProps.onAddUser ?? initialProps.onAddUser}
        onUpdateTeamMemberVisibility={
          overrideProps.onUpdateTeamMemberVisibility ?? initialProps.onUpdateTeamMemberVisibility
        }
      />
    </Provider>,
  );
};

describe('TeamMembersPopup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    renderComponent();
    expect(screen.getByText(`Members of ${initialProps.selectedTeamName}`)).toBeInTheDocument();
  });

  it('should render "Add" button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('should render "Close" button', () => {
    renderComponent();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('should call onClose when "Close" button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays the team name in the modal header', () => {
    renderComponent();
    expect(screen.getByText(`Members of ${initialProps.selectedTeamName}`)).toBeInTheDocument();
  });
});
