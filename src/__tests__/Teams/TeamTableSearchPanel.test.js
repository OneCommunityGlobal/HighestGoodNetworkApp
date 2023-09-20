import React from 'react';
import TeamTableSearchPanel from 'components/Teams/TeamTableSearchPanel';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { render, fireEvent } from '@testing-library/react';
import thunk from 'redux-thunk';
import { authMock, userProfileMock, rolesMock } from '../../__tests__/mockStates';

const mockStore = configureStore([thunk]);

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
        frontPermissions: ['postTeam'],
      },
    },
  },
  requestorRole: '',
  userPermissions: [],
  onClose: jest.fn(),
  onDeleteClick: jest.fn(),
  onCreateNewTeamClick: jest.fn(),
};

let store;

beforeEach(() => {
  store = mockStore({
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
  });
});

describe('TeamTableSearchPanel', () => {
  it('should render without crashing', () => {
    render(
      <Provider store={store}>
        <TeamTableSearchPanel />;
      </Provider>,
    );
  });

  it('renders the "Create New Team" button when user has permission', () => {
    const { getByRole } = render(
      <Provider store={store}>
        <TeamTableSearchPanel {...initialProps} />;
      </Provider>,
    );

    const createNewTeamButton = getByRole('button', { name: 'Create New Team' });
    expect(createNewTeamButton).toBeInTheDocument();
  });

  it('calls onCreateNewTeamClick when the "Create New Team" button is clicked', () => {
    const { getByRole } = render(
      <Provider store={store}>
        <TeamTableSearchPanel {...initialProps} />;
      </Provider>,
    );

    const createNewTeamButton = getByRole('button', { name: 'Create New Team' });
    fireEvent.click(createNewTeamButton);
    expect(initialProps.onCreateNewTeamClick).toHaveBeenCalled();
  });
});
