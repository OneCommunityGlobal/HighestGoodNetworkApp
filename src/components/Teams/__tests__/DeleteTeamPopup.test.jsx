import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import DeleteTeamPopup from '~/components/Teams/DeleteTeamPopup';
import { renderWithProvider } from '../../../__tests__/utils';
import { authMock, userProfileMock, rolesMock, themeMock } from '../../../__tests__/mockStates';

const mock = vi.fn();
const mockStore = configureMockStore([thunk]);
let store;
beforeEach(() => {
  mock.mockClear();
});
const defaultProps = {
  open: true,
  teamName: 'Example Team',
  isEdit: false,
  onDeleteClick: mock,
  onSetInactiveClick: mock,
  onClose: mock,
  selectedTeamId: 1,
};

beforeEach(() => {
  store = mockStore({
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
    theme: themeMock,
    ...defaultProps,
  });
});

describe('DeleteTeamPopup', () => {
  it('should call closePopup function', () => {
    renderWithProvider(
      <DeleteTeamPopup
        open={defaultProps.open}
        teamName={defaultProps.teamName}
        isEdit={defaultProps.isEdit}
        onDeleteClick={defaultProps.onDeleteClick}
        onSetInactiveClick={defaultProps.onSetInactiveClick}
        onClose={defaultProps.onClose}
        selectedTeamId={defaultProps.selectedTeamId}
      />,
      { store },
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('should call onSetInactiveClick when "Set Inactive" button is clicked', () => {
    renderWithProvider(
      <DeleteTeamPopup
        open={defaultProps.open}
        teamName={defaultProps.teamName}
        isEdit={defaultProps.isEdit}
        onDeleteClick={defaultProps.onDeleteClick}
        onSetInactiveClick={defaultProps.onSetInactiveClick}
        onClose={defaultProps.onClose}
        selectedTeamId={defaultProps.selectedTeamId}
      />,
      { store },
    );

    const setInactiveButton = screen.getByText('Set Inactive');
    fireEvent.click(setInactiveButton);

    expect(defaultProps.onSetInactiveClick).toHaveBeenCalledTimes(1);
  });

  it('should call onDeleteClick when "Confirm" button is clicked', () => {
    renderWithProvider(
      <DeleteTeamPopup
        open={defaultProps.open}
        teamName={defaultProps.teamName}
        isEdit={defaultProps.isEdit}
        onDeleteClick={defaultProps.onDeleteClick}
        onSetInactiveClick={defaultProps.onSetInactiveClick}
        onClose={defaultProps.onClose}
        selectedTeamId={defaultProps.selectedTeamId}
      />,
      { store },
    );

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    expect(defaultProps.onDeleteClick).toHaveBeenCalledTimes(1);
    expect(defaultProps.onDeleteClick).toHaveBeenCalledWith(1);
  });

  it('should render the modal when open is true', () => {
    renderWithProvider(
      <DeleteTeamPopup
        open={defaultProps.open}
        teamName={defaultProps.teamName}
        isEdit={defaultProps.isEdit}
        onDeleteClick={defaultProps.onDeleteClick}
        onSetInactiveClick={defaultProps.onSetInactiveClick}
        onClose={defaultProps.onClose}
        selectedTeamId={defaultProps.selectedTeamId}
      />,
      { store },
    );

    const modal = screen.getByText('Delete');
    expect(modal).toBeInTheDocument();
  });
});
