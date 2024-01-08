import React from 'react';
import { render, screen } from '@testing-library/react';
import PopUpBar from './PopUpBar';

describe('PopUpBar Component', () => {
  it('renders when isViewing is true', () => {
    const userProfile = {
      firstName: 'TestUser',
      lastName: 'LastName',
    };

    render(<PopUpBar userProfile={userProfile} isViewing={true} />);
    
    // Add your assertions for rendering when isViewing is true
    const popupContainer = screen.getByTestId('test-popup');
    expect(popupContainer).toBeInTheDocument();
  });

  it('does not render when isViewing is false', () => {
    // Render PopUpBar with isViewing set to false
    render(<PopUpBar userProfile={{}} isViewing={false} />);
    
    // Add your assertions for not rendering when isViewing is false
    const popupContainer = screen.queryByTestId('test-popup');
    expect(popupContainer).not.toBeInTheDocument();
  });

  // Add more test cases for different scenarios as needed
});
