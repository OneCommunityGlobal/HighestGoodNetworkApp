import React from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import Input from './Input';

describe('Input Component', () => {
  // 1. Rendering Test
  it('renders without crashing', () => {
    render(<Input label="Test Label" name="testName" />);
    expect(screen.getByLabelText(/test label/i)).toBeInTheDocument();
  });

  // 2. Props Test
  it('displays the passed label and name', () => {
    render(<Input label="Test Label" name="testName" />);
    expect(screen.getByLabelText(/test label/i)).toHaveAttribute('name', 'testName');
  });

  // 3. Class Name Test
  it('applies additional class names when passed', () => {
    const { container } = render(
      <Input label="Test Label" name="testName" className="additional-class" />,
    );
    const divElement = container.querySelector('.form-group');
    expect(divElement).toHaveClass('form-group additional-class');
  });

  // 4. Error Display Test
  it('displays an error message when an error is provided', () => {
    const errorMessage = 'Test Error';
    render(<Input label="Test Label" name="testName" error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('alert alert-danger mt-1');
  });

  // 5. Event Handling Test
  it('calls onChange handler when changed', () => {
    const handleChange = jest.fn();
    render(<Input label="Test Label" name="testName" onChange={handleChange} />);
    const input = screen.getByLabelText(/test label/i);
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
