import React from 'react';
import { Provider } from 'react-redux';
import TeamMembersPopup from 'components/Teams/TeamMembersPopup';
import configureStore from 'redux-mock-store';
import { render, screen, fireEvent } from '@testing-library/react';
import thunk from 'redux-thunk';
import { authMock, userProfileMock, rolesMock } from '../../__tests__/mockStates';

const mockStore = configureStore([thunk]);

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

const initialProps = {
  open: true,
  selectedTeamName: 'Test Team',
  hasPermission: jest.fn(),
  members: {
    teamMembers: {
      toSorted: jest.fn(() => []),
    },
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
  requestorRole: '',
  userPermissions: [],
  onClose: jest.fn(),
  onDeleteClick: jest.fn(),
};

describe('TeamMembersPopup', () => {
  it('renders without crashing', () => {
    renderComponent(initialProps);
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('should call closePopup function', () => {
    renderComponent(initialProps);
    fireEvent.click(screen.getByText('Close'));
    expect(initialProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should render "Close" button', () => {
    renderComponent(initialProps);
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('displays the team name in the modal header', () => {
    renderComponent(initialProps);
    expect(screen.getByText(`Members of ${initialProps.selectedTeamName}`)).toBeInTheDocument();
  });
});
