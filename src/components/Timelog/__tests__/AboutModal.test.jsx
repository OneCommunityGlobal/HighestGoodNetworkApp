import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AboutModal from '../TimeEntryForm/AboutModal'; // Adjust the path as necessary

describe('AboutModal Component', () => {
  const mockSetVisible = vi.fn();

  const baseProps = {
    visible: true,
    setVisible: mockSetVisible,
  };

  it('should render the modal when visible is true', () => {
    render(
      <AboutModal 
        visible={baseProps.visible}
        setVisible={baseProps.setVisible}
      />
    );
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getAllByText(/This is the One Community time clock!/i).length).toBeGreaterThan(0);
  });

  it('should not render the modal when visible is false', () => {
    render(
      <AboutModal 
        visible={false}
        setVisible={baseProps.setVisible}
      />
    );
    expect(screen.queryByText('Info')).not.toBeInTheDocument();
  });

  it('should render Close button and trigger setVisible on click', () => {
    render(
      <AboutModal 
        visible={baseProps.visible}
        setVisible={baseProps.setVisible}
      />
    );
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    expect(mockSetVisible).toHaveBeenCalledWith(false);
  });
});