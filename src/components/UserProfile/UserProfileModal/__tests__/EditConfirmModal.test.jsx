import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import EditConfirmModal from '../EditConfirmModal';

const closeModalMock = vi.fn();
describe('UserProfileModal', () => {
  const props = {
    modalTitle: 'Success!',
    modalMessage: '',
    isOpen: true,
    disabled: false,
  };
  beforeEach(() => {
    // eslint-disable-next-line testing-library/no-render-in-lifecycle
    render(<EditConfirmModal {...props} closeModal={closeModalMock} />);
  });

  it('should render edit confirm modal', () => {
    expect(screen.getByText(/success!/i)).toBeInTheDocument();
  });

  it('should call closeModal function once the user clicks the close buttons', async () => {
    screen.getAllByRole('button', { name: /close/i }).forEach(button => fireEvent.click(button));
    expect(closeModalMock).toHaveBeenCalled();
  });
});
