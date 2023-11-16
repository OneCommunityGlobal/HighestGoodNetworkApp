import React from 'react';
import { render, screen } from '@testing-library/react';
import Image from './Image'; // Adjust the import path as necessary

describe('Image Component', () => {
  // Test Case 1: It should render the image with the correct props
  it('renders the image with correct props', () => {
    const props = {
      label: 'Test Image',
      name: 'testImage',
      src: 'test-image.jpg',
      className: 'test-class',
    };

    render(<Image {...props} />);

    const image = screen.getByRole('img', { name: props.label });
    expect(image).toHaveAttribute('src', props.src);
    expect(image).toHaveAttribute('id', props.name);
    expect(image).toHaveAttribute('name', props.name);
    expect(image).toHaveAttribute('alt', props.label);
    expect(image).toHaveClass('img-responsive test-class');
  });

  // Test Case 2: It should display the label
  it('displays the label', () => {
    const props = {
      label: 'Test Image',
      name: 'testImage',
    };

    render(<Image {...props} />);
    const label = screen.getByText(props.label);
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', props.name);
  });

  // Test Case 3: It should display an error message when there is an error
  it('displays an error message when there is an error', () => {
    const props = {
      label: 'Test Image',
      name: 'testImage',
      error: 'Error loading image',
    };

    render(<Image {...props} />);
    const errorMessage = screen.getByText(props.error);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('alert alert-danger mt-1');
  });

  // Test Case 4: It should not display an error message when there is no error
  it('does not display an error message when there is no error', () => {
    const props = {
      label: 'Test Image',
      name: 'testImage',
    };

    render(<Image {...props} />);
    const errorMessage = screen.queryByText(/error/i);
    expect(errorMessage).not.toBeInTheDocument();
  });
});