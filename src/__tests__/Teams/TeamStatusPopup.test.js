import React from 'react';
import TeamStatusPopup from 'components/Teams/TeamStatusPopup';
import { renderWithProvider } from '__tests__/utils';
import { screen, fireEvent } from '@testing-library/react';

const mock = jest.fn();

const defaultProps = {
  open: true,
  selectedTeamName: 'Team 1',
  selectedStatus: true,
  onClose: mock,
  onConfirmClick: mock,
};

describe('TeamStatusPopup', () => {
  it('should render correctly', () => {
    const { getByText } = renderWithProvider(<TeamStatusPopup {...defaultProps} />);

    expect(getByText('Status Popup')).toBeInTheDocument();

    expect(
      getByText('Are you sure you want to change the status of this team Team 1'),
    ).toBeInTheDocument();

    expect(getByText('Confirm')).toBeInTheDocument();
    expect(getByText('Close')).toBeInTheDocument();
  });

  it('should call closePopup function', () => {
    renderWithProvider(<TeamStatusPopup {...defaultProps} />);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mock).toHaveBeenCalledTimes(1);
  });
});
