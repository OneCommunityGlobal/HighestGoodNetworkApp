import React from 'react';
import DeleteTeamPopup from 'components/Teams/DeleteTeamPopup';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProvider } from '../../__tests__/utils';

const defaultProps = {
  open: true,
  teamName: 'Example Team',
  isEdit: false,
  onDeleteClick: jest.fn(),
  onSetInactiveClick: jest.fn(),
};

const mock = jest.fn();

describe('DeleteTeamPopup', () => {
  it('should call closePopup function', () => {
    renderWithProvider(<DeleteTeamPopup {...defaultProps} onClose={mock} />);

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
});
