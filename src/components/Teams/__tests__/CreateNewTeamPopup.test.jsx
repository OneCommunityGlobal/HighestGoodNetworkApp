import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import CreateNewTeamPopup from '~/components/Teams/CreateNewTeamPopup';
import { renderWithProvider } from '../../../__tests__/utils';

const defaultProps = {
  open: true,
  teamName: 'Example Team',
  isEdit: false,
};

const mock = vi.fn();
beforeEach(() => {
  mock.mockClear();
});
describe('CreateNewTeamPopUp', () => {
  it('should call closePopup function', () => {
    renderWithProvider(
      <CreateNewTeamPopup
        open={defaultProps.open}
        teamName={defaultProps.teamName}
        isEdit={defaultProps.isEdit}
        onClose={mock}
      />,
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('should call OK button function', () => {
    renderWithProvider(
      <CreateNewTeamPopup
        open={defaultProps.open}
        teamName={defaultProps.teamName}
        isEdit={defaultProps.isEdit}
        onOkClick={mock}
      />,
    );

    const okButton = screen.getByText('OK');
    fireEvent.click(okButton);

    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('should render "Update Team Name" title when isEdit is true', () => {
    renderWithProvider(
      <CreateNewTeamPopup open={defaultProps.open} teamName={defaultProps.teamName} isEdit />,
    );

    const titleElement = screen.getByText('Update Team Name');
    expect(titleElement).toBeInTheDocument();
  });

  it('should render "Create New Team" title when isEdit is false', () => {
    renderWithProvider(
      <CreateNewTeamPopup
        open={defaultProps.open}
        teamName={defaultProps.teamName}
        isEdit={false}
      />,
    );

    const titleElement = screen.getByText('Create New Team');
    expect(titleElement).toBeInTheDocument();
  });

  it('should update the newTeam state on input change', () => {
    renderWithProvider(
      <CreateNewTeamPopup
        open={defaultProps.open}
        teamName={defaultProps.teamName}
        isEdit={defaultProps.isEdit}
      />,
    );

    const inputElement = screen.getByPlaceholderText('Please enter a new team name');

    fireEvent.change(inputElement, { target: { value: 'New Team Name' } });

    expect(inputElement.value).toBe('New Team Name');
  });

  it('should not show an error message and call onOkClick when team name is not empty', () => {
    renderWithProvider(
      <CreateNewTeamPopup
        open={defaultProps.open}
        teamName={defaultProps.teamName}
        isEdit={defaultProps.isEdit}
        onOkClick={mock}
        isValidTeam
      />,
    );

    const okButton = screen.getByText('OK');
    const inputElement = screen.getByPlaceholderText('Please enter a new team name');

    fireEvent.change(inputElement, { target: { value: 'New Team Name' } });

    fireEvent.click(okButton);

    const errorMessage = screen.queryByText('Please enter a team name.');
    expect(errorMessage).toBeNull();
    expect(mock).toHaveBeenCalledWith('New Team Name', false);
  });

  it('should clear the error message when a valid team name is entered after an invalid attempt', () => {
    renderWithProvider(
      <CreateNewTeamPopup
        open={defaultProps.open}
        teamName={defaultProps.teamName}
        isEdit={defaultProps.isEdit}
        onOkClick={mock}
        isValidTeam={false}
      />,
    );

    const okButton = screen.getByText('OK');
    const inputElement = screen.getByPlaceholderText('Please enter a new team name');

    fireEvent.change(inputElement, { target: { value: '' } });

    fireEvent.click(okButton);

    let errorMessage = screen.getByText('Please enter a team name.');
    expect(errorMessage).toBeInTheDocument();

    fireEvent.change(inputElement, { target: { value: 'New Team Name' } });

    errorMessage = screen.queryByText('Please enter a team name.');
    expect(errorMessage).toBeNull();
  });

  it('should focus the input field when modal is opened', () => {
    renderWithProvider(<CreateNewTeamPopup open teamName="Example Team" isEdit={false} />);

    const inputElement = screen.getByPlaceholderText('Please enter a new team name');
    expect(inputElement).toHaveFocus();
  });
});
