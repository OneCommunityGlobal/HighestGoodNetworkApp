import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // for the "toBeInTheDocument" matcher
import { Checkbox } from './Checkbox';

describe('Checkbox Component', () => {

  test('renders correctly with label', () => {
    const { getByRole, getByText } = render(<Checkbox label="Test Label" id="test-checkbox" />);

    const checkbox = getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();

    const label = getByText('Test Label');
    expect(label).toBeInTheDocument();
  });

  test('handles onChange and changes checked state', () => {
    const handleChange = jest.fn();
    const { getByRole } = render(<Checkbox label="Test Label" id="test-checkbox" onChange={handleChange} />);

    const checkbox = getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(checkbox.checked).toBe(true);
  });

  test('renders with passed className for the wrapper', () => {
    const wrapperClassName = "custom-wrapper-class";
    const { container } = render(<Checkbox label="Test Label" id="test-checkbox" wrapperClassname={wrapperClassName} />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('checkbox-wrapper', wrapperClassName);
  });
});

