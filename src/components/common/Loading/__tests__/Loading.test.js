import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from '../Loading'; // Adjust the import path as per your project structure

describe('Loading Component', () => {
  it('renders loading', () => {
    render(<Loading />);

    // Check if the spinner is in the document
    const loadingElement = screen.getByTestId('loading');
    expect(loadingElement).toBeInTheDocument();
  });

  it('renders loading spinner', () => {
    render(<Loading />);

    // Check if the spinner is in the document
    const spinnerElement = screen.getByTestId('loading-spinner');
    expect(spinnerElement).toBeInTheDocument();
    // Check for the specific class to ensure the right element is rendered
    expect(spinnerElement).toHaveClass('fa-spinner fa-pulse');
  });
});
