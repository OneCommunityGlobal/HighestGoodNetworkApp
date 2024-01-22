import React from 'react';
import DeleteTeamPopup from 'components/Teams/DeleteTeamPopup';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProvider } from '../../../__tests__/utils';

const mock = jest.fn();

const defaultProps = {
  open: true,
  teamName: 'Example Team',
  isEdit: false,
  onDeleteClick: mock,
  onSetInactiveClick: mock,
  onClose: mock,
  selectedTeamId: 1,
};

describe('DeleteTeamPopup', () => {
  it('should call closePopup function', () => {
    renderWithProvider(<DeleteTeamPopup {...defaultProps} />);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('should call onSetInactiveClick when "Set Inactive" button is clicked', () => {
    renderWithProvider(<DeleteTeamPopup {...defaultProps} />);

    const setInactiveButton = screen.getByText('Set Inactive');
    fireEvent.click(setInactiveButton);

    expect(defaultProps.onSetInactiveClick).toHaveBeenCalledTimes(1);
  });

  it('should call onDeleteClick when "Confirm" button is clicked', () => {
    renderWithProvider(<DeleteTeamPopup {...defaultProps} />);

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    expect(defaultProps.onDeleteClick).toHaveBeenCalledTimes(1);
    expect(defaultProps.onDeleteClick).toHaveBeenCalledWith(1);
  });

  it('should render the modal when open is true', () => {
    renderWithProvider(<DeleteTeamPopup {...defaultProps} />);

    const modal = screen.getByText('Delete');
    expect(modal).toBeInTheDocument();
  });
});
