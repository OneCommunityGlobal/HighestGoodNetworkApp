import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import { userProfileMock } from '../../../../__tests__/mockStates';
import EditConfirmModal from '../EditConfirmModal';


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const closeModalMock = jest.fn()
describe('UserProfileModal', () => {
  const props = {
  modalTitle:"Success!",
  modalMessage:"",  
  userProfile:userProfileMock,
  isOpen:true,
}
  beforeEach(() => {
    render(<EditConfirmModal {...props} closeModal={closeModalMock}/>);
  });

  it('should render edit confirm modal', () => {
    expect(screen.getByText(/success!/i)).toBeInTheDocument();
  });
  
  it('should call closeModal function once the user clicks the close buttons', async () => {
    screen
      .getAllByRole('button', { name: /close/i })
      .forEach((button) => fireEvent.click(button));
      expect(closeModalMock).toHaveBeenCalled();
  });
});
