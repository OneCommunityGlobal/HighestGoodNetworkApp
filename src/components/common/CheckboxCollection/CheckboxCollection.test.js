import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CheckboxCollection from './CheckboxCollection'; // Adjust the import path accordingly.

describe('CheckboxCollection', () => {
  const mockOnChange = jest.fn();
  
  const sampleItems = [
    { _id: '1', name: 'Item 1' },
    { _id: '2', name: 'Item 2' },
    { _id: '3', name: 'Item 3' },
  ];

  it('renders without crashing', () => {
    render(<CheckboxCollection items={sampleItems} pathName="name" isChecked={() => false} onChange={mockOnChange} />);
  });

  it('renders the correct number of checkboxes', () => {
    render(<CheckboxCollection items={sampleItems} pathName="name" isChecked={() => false} onChange={mockOnChange} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(sampleItems.length);
  });

  it('handles onChange when a checkbox is clicked', () => {
    render(<CheckboxCollection items={sampleItems} pathName="name" isChecked={() => false} onChange={mockOnChange} />);
    const checkbox = screen.getByLabelText('Item 1');
    fireEvent.click(checkbox);
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('shows the error message if the error prop is provided', () => {
    const errorMsg = 'Sample error message';
    render(<CheckboxCollection items={sampleItems} pathName="name" isChecked={() => false} onChange={mockOnChange} error={errorMsg} />);
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });
});
