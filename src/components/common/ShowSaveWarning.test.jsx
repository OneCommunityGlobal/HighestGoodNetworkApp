import React from 'react';
import { render } from '@testing-library/react';
import ShowSaveWarning from './ShowSaveWarning';

describe('ShowSaveWarning component', () => {
  it('renders without crashing', () => {
    render(<ShowSaveWarning />);
  });

  it('renders with the correct class', () => {
    const { container } = render(<ShowSaveWarning />);
    const warningElement = container.firstChild;
    expect(warningElement).toHaveClass('border bg-danger text-white form-row mt-2 mb-2');
  });

  it('renders the correct warning message', () => {
    const { getByText } = render(<ShowSaveWarning />);
    const warningMessage = getByText(
      /REMEMBER TO CLICK THE "SAVE CHANGES" BUTTON AT THE BOTTOM OF THE PAGE BEFORE LEAVING. YOUR CHANGES WILL BE LOST IF YOU DON'T DO THIS./
    );
    expect(warningMessage).toBeInTheDocument();
  });
});