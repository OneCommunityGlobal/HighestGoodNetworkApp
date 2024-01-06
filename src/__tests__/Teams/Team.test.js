import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import Team from 'components/Teams/Team';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithProvider } from '../../__tests__/utils';
import { authMock, userProfileMock, rolesMock } from '../../__tests__/mockStates';

const mockStore = configureStore([thunk]);

let store;

const mockDefault = jest.fn();

const teamProps = {
  name: 'Team Name',
  teamId: 1,
  active: true,
  teamCode: 'X-XXX',
  onEditTeam: mockDefault,
  onDeleteClick: mockDefault,
  onMembersClick: mockDefault,
  onStatusClick: mockDefault,
};

beforeEach(() => {
  store = mockStore({
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
    ...teamProps,
  });
});

describe('Team component', () => {
  it('should call onEditTeam function', () => {
    renderWithProvider(<Team {...teamProps} />, { store });

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(teamProps.onEditTeam).toHaveBeenCalledWith('Team Name', 1, true, 'X-XXX');
  });

  it('should call onDeleteClick function', () => {
    renderWithProvider(<Team {...teamProps} />, { store });

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(teamProps.onDeleteClick).toHaveBeenCalledWith('Team Name', 1, true, 'X-XXX');
  });

  // it('should call onMembersClick function', () => {
  //   renderWithProvider(<Team {...teamProps} />, { store });

  //   const memberButton = screen.getByTestId('members-btn');
  //   fireEvent.click(memberButton);

  //   expect(teamProps.onMembersClick).toHaveBeenCalledWith(1, 'Team Name', 'X-XXX');
  // });

  // it('should call onStatusClick function', () => {
  //   renderWithProvider(<Team {...teamProps} />, { store });

  //   const activeMarker = screen.getByTestId('active-marker');
  //   fireEvent.click(activeMarker);

  //   expect(teamProps.onStatusClick).toHaveBeenCalledWith('Team Name', 1, true, 'X-XXX');
  // });
});
