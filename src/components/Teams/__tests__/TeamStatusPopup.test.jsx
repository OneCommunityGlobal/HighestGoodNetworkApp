import React from 'react';
import { renderWithProvider } from '__tests__/utils';
import { screen, fireEvent } from '@testing-library/react';
import TeamStatusPopup from '~/components/Teams/TeamStatusPopup';

const mock = vi.fn();
beforeEach(() => {
  mock.mockClear();
});
const defaultProps = {
  open: true,
  selectedTeamName: 'Team 1',
  selectedStatus: true,
  onClose: mock,
  onConfirmClick: mock,
};

describe('TeamStatusPopup', () => {
  it('should render correctly', () => {
    renderWithProvider(
      <TeamStatusPopup
        open={defaultProps.open}
        selectedTeamName={defaultProps.selectedTeamName}
        selectedStatus={defaultProps.selectedStatus}
        onClose={defaultProps.onClose}
        onConfirmClick={defaultProps.onConfirmClick}
      />,
    );

    expect(screen.getByText('Status Popup')).toBeInTheDocument();

    expect(
      screen.getByText(
        'Are you sure you want to change the status of this team Team 1 to inactive?',
      ),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();

    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    expect(closeButtons[1]).toBeInTheDocument();
  });

  it('should call closePopup function', () => {
    renderWithProvider(
      <TeamStatusPopup
        open={defaultProps.open}
        selectedTeamName={defaultProps.selectedTeamName}
        selectedStatus={defaultProps.selectedStatus}
        onClose={defaultProps.onClose}
        onConfirmClick={defaultProps.onConfirmClick}
      />,
    );

    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    fireEvent.click(closeButtons[1]);

    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirmClick when "Confirm" button is clicked', () => {
    renderWithProvider(
      <TeamStatusPopup
        open={defaultProps.open}
        selectedTeamName={defaultProps.selectedTeamName}
        selectedStatus={defaultProps.selectedStatus}
        onClose={defaultProps.onClose}
        onConfirmClick={defaultProps.onConfirmClick}
      />,
    );

    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmButton);

    expect(defaultProps.onConfirmClick).toHaveBeenCalledTimes(1);
  });

  it('should not re-render with the same props', () => {
    const view = renderWithProvider(
      <TeamStatusPopup
        open={defaultProps.open}
        selectedTeamName={defaultProps.selectedTeamName}
        selectedStatus={defaultProps.selectedStatus}
        onClose={defaultProps.onClose}
        onConfirmClick={defaultProps.onConfirmClick}
      />,
    );
    const { renderCount } = TeamStatusPopup;

    view.rerender(
      <TeamStatusPopup
        open={defaultProps.open}
        selectedTeamName={defaultProps.selectedTeamName}
        selectedStatus={defaultProps.selectedStatus}
        onClose={defaultProps.onClose}
        onConfirmClick={defaultProps.onConfirmClick}
      />,
    );

    expect(TeamStatusPopup.renderCount).toBe(renderCount);
  });

  it('should render dynamic content', () => {
    renderWithProvider(
      <TeamStatusPopup
        open={defaultProps.open}
        selectedTeamName="Team 2"
        selectedStatus={false}
        onClose={defaultProps.onClose}
        onConfirmClick={defaultProps.onConfirmClick}
      />,
    );

    expect(
      screen.getByText('Are you sure you want to change the status of this team Team 2 to active?'),
    ).toBeInTheDocument();
  });
});
