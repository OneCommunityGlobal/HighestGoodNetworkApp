// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Checkbox } from '../Checkbox';

describe('Checkbox Component', () => {
  test('renders correctly with label', () => {
    const { getByRole, getByText } = render(<Checkbox label="Test Label" id="test-checkbox" />);

    // eslint-disable-next-line testing-library/prefer-screen-queries
    const checkbox = getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();

    // eslint-disable-next-line testing-library/prefer-screen-queries
    const label = getByText('Test Label');
    expect(label).toBeInTheDocument();
  });

  test('handles onChange and changes checked state', () => {
    const handleChange = vi.fn();
    const { getByRole } = render(
      <Checkbox label="Test Label" id="test-checkbox" onChange={handleChange} />,
    );

    // eslint-disable-next-line testing-library/prefer-screen-queries
    const checkbox = getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(checkbox.checked).toBe(true);
  });

  test('renders with passed className for the wrapper', () => {
    const wrapperClassName = 'custom-wrapper-class';
    const { container } = render(
      <Checkbox label="Test Label" id="test-checkbox" wrapperClassname={wrapperClassName} />,
    );

    // eslint-disable-next-line testing-library/no-node-access
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('checkbox-wrapper', wrapperClassName);
  });
});
