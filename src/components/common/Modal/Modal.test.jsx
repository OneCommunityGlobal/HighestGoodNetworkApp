import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModalExample from './Modal';

describe('ModalExample Component', () => {
  it('renders when isOpen is true', () => {
    render(<ModalExample isOpen modalTitle="Test Modal" />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    const closeModalMock = jest.fn();
    render(<ModalExample isOpen closeModal={closeModalMock} modalTitle="Test Modal" />);
    fireEvent.click(screen.getByText('Close'));
    expect(closeModalMock).toHaveBeenCalledTimes(1);
  });

  it('displays input fields when type is input', () => {
    render(<ModalExample isOpen type="input" />);
    expect(screen.getByPlaceholderText('Name of the link')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('URL of the link')).toBeInTheDocument();
  });

  it('updates state when input fields are typed into', () => {
    render(<ModalExample isOpen type="input" />);
    fireEvent.change(screen.getByPlaceholderText('Name of the link'), {
      target: { value: 'Test Link Name' },
    });
    fireEvent.change(screen.getByPlaceholderText('URL of the link'), {
      target: { value: 'https://testurl.com' },
    });
    expect(screen.getByPlaceholderText('Name of the link')).toHaveValue('Test Link Name');
    expect(screen.getByPlaceholderText('URL of the link')).toHaveValue('https://testurl.com');
  });

  it('disables confirm button when input fields are empty', () => {
    render(<ModalExample isOpen type="input" />);
    expect(screen.getByText('Add')).toBeDisabled();
  });

  it('calls setInactiveModal when "Set inactive" button is clicked', () => {
    const setInactiveModalMock = jest.fn();
    const { getByText } = render(
      <ModalExample
        isOpen
        closeModal={() => {}}
        setInactiveModal={setInactiveModalMock}
        modalTitle="Test Modal"
      />,
    );

    const setInactiveButton = getByText(/set inactive/i);
    fireEvent.click(setInactiveButton);

    expect(setInactiveModalMock).toHaveBeenCalled();
  });

  it('calls confirmModal when confirm button is clicked', () => {
    const confirmModalMock = jest.fn();
    render(
      <ModalExample
        isOpen
        type="input"
        confirmModal={confirmModalMock}
        linkType="Test Link Type"
      />,
    );
    fireEvent.change(screen.getByPlaceholderText('Name of the link'), {
      target: { value: 'Test Link Name' },
    });
    fireEvent.change(screen.getByPlaceholderText('URL of the link'), {
      target: { value: 'https://testurl.com' },
    });
    fireEvent.click(screen.getByText('Add'));
    expect(confirmModalMock).toHaveBeenCalledWith(
      'Test Link Name',
      'https://testurl.com',
      'Test Link Type',
    );
  });
});
