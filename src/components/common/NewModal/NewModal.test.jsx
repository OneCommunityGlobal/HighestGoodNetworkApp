import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { NewModal } from './NewModal';

describe('NewModal Component', () => {
  const triggerText = 'Open Modal';

  it('opens the modal when the trigger element is clicked', () => {
    render(
      <NewModal header="Test Modal" trigger={<button>{triggerText}</button>}>
        {/* Modal content here */}
      </NewModal>
    );

    const triggerButton = screen.getByText(triggerText);
    fireEvent.click(triggerButton);
    const modalContent = screen.getByText('Test Modal');
    expect(modalContent).toBeInTheDocument();
  });

  it('closes the modal when the close button is clicked', () => {
    render(
      <NewModal header="Test Modal" trigger={<button>{triggerText}</button>}>
        {/* Modal content here */}
      </NewModal>
    );

    const triggerButton = screen.getByText(triggerText);
    fireEvent.click(triggerButton);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    const modalContent = screen.queryByText('Test Modal');
    expect(modalContent).toBeNull();
  });

  it('closes the modal when the close icon is clicked', () => {
    render(
      <NewModal header="Test Modal" trigger={<button>{triggerText}</button>}>
        {/* Modal content here */}
      </NewModal>
    );
  
    const triggerButton = screen.getByText(triggerText);
    fireEvent.click(triggerButton);
  
    const closeIcon = screen.getByText('✕'); // Match the close icon by its content (✕)
    fireEvent.click(closeIcon);
  
    const modalContent = screen.queryByText('Test Modal');
    expect(modalContent).toBeNull();
  });
  

  it('displays the modal header correctly', () => {
    render(
      <NewModal header="Test Modal" trigger={<button>{triggerText}</button>}>
        {/* Modal content here */}
      </NewModal>
    );

    const triggerButton = screen.getByText(triggerText);
    fireEvent.click(triggerButton);

    const modalHeader = screen.getByText('Test Modal');
    expect(modalHeader).toBeInTheDocument();
  });

  it('modal close button works', () => {
    render(
      <NewModal header="Test Modal" trigger={<button>{triggerText}</button>}>
        {/* Modal content here */}
      </NewModal>
    );

    const triggerButton = screen.getByText(triggerText);
    fireEvent.click(triggerButton);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    const modalContent = screen.queryByText('Test Modal');
    expect(modalContent).toBeNull();
  });
});
