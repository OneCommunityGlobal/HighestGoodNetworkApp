// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Checkbox } from '../Checkbox';

describe('Checkbox Component', () => {
  test('renders correctly with label', () => {
    render(<Checkbox label="Test Label" id="test-checkbox" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();

    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
  });

  test('handles onChange and changes checked state', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Test Label" id="test-checkbox" onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(checkbox.checked).toBe(true);
  });

  test('renders with passed className for the wrapper', () => {
    const wrapperClassName = 'custom-wrapper-class';
    render(<Checkbox label="Test Label" id="test-checkbox" wrapperClassname={wrapperClassName} />);

    const wrapper = screen.getByTestId('checkbox-wrapper');
    expect(wrapper).toHaveClass('checkbox-wrapper', wrapperClassName);
  });
});
