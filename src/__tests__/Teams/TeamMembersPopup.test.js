import React from 'react';
import { Provider } from 'react-redux';
import TeamMembersPopup from 'components/Teams/TeamMembersPopup';
import configureStore from 'redux-mock-store';
import { render, screen, fireEvent } from '@testing-library/react';
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
        frontPermissions: ['assignTeamToUsers'],
      },
    },
  },
  requestorRole: '',
  userPermissions: [],
  onClose: jest.fn(),
  onDeleteClick: jest.fn(),
};

let store;

beforeEach(() => {
  store = mockStore({
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
    ...initialProps,
  });
});

describe('TeamMembersPopup', () => {
  it('renders without crashing', () => {
    const { getByText } = render(
      <Provider store={store}>
        <TeamMembersPopup {...initialProps} />
      </Provider>,
    );

    const addButton = getByText('Add');
    expect(addButton).toBeInTheDocument();
  });

  it('should call closePopup function', () => {
    render(
      <Provider store={store}>
        <TeamMembersPopup {...initialProps} />
      </Provider>,
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(initialProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('displays "Add" button if user has "assignTeamToUsers" permission', () => {
    initialProps.hasPermission.mockReturnValue(true);

    render(
      <Provider store={store}>
        <TeamMembersPopup {...initialProps} />
      </Provider>,
    );

    const addButton = screen.getByText('Add');
    expect(addButton).toBeInTheDocument();
  });

  it('display "Delete" button if user has permission to delete members', () => {
    initialProps.hasPermission.mockReturnValue(true);

    render(
      <Provider store={store}>
        <TeamMembersPopup {...initialProps} />
      </Provider>,
    );

    const deleteButton = screen.queryByText('Delete');
    expect(deleteButton).toBeNull();
  });

  it('does not display "Delete" button if user does not have permission to delete members', () => {
    initialProps.hasPermission.mockReturnValue(false);

    render(
      <Provider store={store}>
        <TeamMembersPopup {...initialProps} />
      </Provider>,
    );

    const deleteButton = screen.queryByText('Delete');
    expect(deleteButton).not.toBeInTheDocument();
  });
});
