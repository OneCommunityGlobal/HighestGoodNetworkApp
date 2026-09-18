import React from 'react';
import { render, screen } from '@testing-library/react';
import ShowSaveWarning from './ShowSaveWarning';

describe('ShowSaveWarning component', () => {
  it('renders without crashing', () => {
    render(<ShowSaveWarning />);
  });

  it('renders with the correct class', () => {
    render(<ShowSaveWarning />);
    const element = screen.getByTestId('save-warning');
    expect(element).toHaveClass('border bg-danger text-white form-row mt-2 mb-2');
  });

  it('renders the correct warning message', () => {
    render(<ShowSaveWarning />);
    const warningMessage = screen.getByText(
      /REMEMBER TO CLICK THE "SAVE CHANGES" BUTTON AT THE BOTTOM OF THE PAGE BEFORE LEAVING. YOUR CHANGES WILL BE LOST IF YOU DON'T DO THIS./i,
    );
    expect(warningMessage).toBeInTheDocument();
  });
});
