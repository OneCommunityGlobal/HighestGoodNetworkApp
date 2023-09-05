import React from 'react';
import CreateNewTeamPopup from 'components/Teams/CreateNewTeamPopup';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProvider } from '../../__tests__/utils';

const defaultProps = {
  open: true,
  teamName: 'Example Team',
  isEdit: false,
  onOkClick: jest.fn(),
  onClose: jest.fn(),
};

describe('CreateNewTeamPopUp', () => {
  it('should call closePopup function', () => {
    const onCloseMock = jest.fn();
    renderWithProvider(<CreateNewTeamPopup {...defaultProps} onClose={onCloseMock} />);

    console.log(screen.debug());

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
