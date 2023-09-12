import React from 'react';
import TeamStatusPopup from 'components/Teams/TeamStatusPopup';
import { renderWithProvider } from '__tests__/utils';

const defaultProps = {
  open: true,
  selectedTeamName: 'Team 1',
  selectedStatus: true,
  onClose: () => {},
  onConfirmClick: () => {},
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
});
