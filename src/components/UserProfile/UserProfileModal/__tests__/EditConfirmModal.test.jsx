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
  beforeEach(() => closeModalMock.mockClear());

  it('should render edit confirm modal', () => {
    render(<EditConfirmModal {...props} closeModal={closeModalMock} />);

    expect(screen.getByText(/success!/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('should call closeModal when the user clicks the close buttons', () => {
    render(<EditConfirmModal {...props} closeModal={closeModalMock} />);

    screen.getAllByRole('button', { name: /close/i }).forEach(button => fireEvent.click(button));
    expect(closeModalMock).toHaveBeenCalled();
  });

  it('should remain open while a save is in progress', () => {
    render(<EditConfirmModal {...props} disabled closeModal={closeModalMock} />);

    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    expect(closeButtons).toHaveLength(1);
    expect(closeButtons[0]).toBeDisabled();
    fireEvent.click(closeButtons[0]);
    fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 });

    expect(closeModalMock).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
