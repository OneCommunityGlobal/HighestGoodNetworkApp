import configureStore from 'redux-mock-store';
import TeamMembersPopup from 'components/Teams/TeamMembersPopup';
import thunk from 'redux-thunk';
import { authMock, userProfileMock, rolesMock } from '../../__tests__/mockStates';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

const mockStore = configureStore([thunk]);

const mockProps = {
  members: { teamMembers: [] },
  usersdata: { userProfiles: [] },
};

const renderComponent = props => {
  const store = mockStore({
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
    ...props,
  });

  render(
    <Provider store={store}>
      <TeamMembersPopup {...props} />
    </Provider>,
  );
};

const initialState = {
  open: true,
  selectedTeamName: 'Test Team',
  hasPermission: jest.fn(),
  members: {
    teamMembers: { toSorted: jest.fn(() => []) },
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
  userProfile: { userProfiles: [] },
  requestorRole: '',
  userPermissions: [],
  onClose: jest.fn(),
  onDeleteClick: jest.fn(),
};

const usersdata = { userProfiles: [] };

describe('TeamMembersPopup', () => {
  it('should render correctly', () => {
    renderComponent(mockProps);
  });

  it('should render "Add" button', () => {
    renderComponent({ ...initialState, usersdata });
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('should render "Close" button', () => {
    renderComponent({ ...initialState, usersdata });
    expect(screen.getByText('Close')).toBeInTheDocument();
  });
});
