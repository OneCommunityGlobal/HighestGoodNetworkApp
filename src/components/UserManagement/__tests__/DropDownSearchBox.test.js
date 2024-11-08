import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import DropDownSearchBox from '../DropDownSearchBox';

describe('DropDownSearchBox', () => {
  const mockSearchCallback = jest.fn();
  const mockItems = ['Option 1', 'Option 2', 'Option 3'];
  const mockProps = {
    id: 'testDropdown',
    placeholder: 'Select an option',
    items: mockItems,
    searchCallback: mockSearchCallback,
    value: '',
    width: '100px',
    className: 'test-class',
  };

  it('renders with correct options', () => {
    const { getByRole, getByText } = render(<DropDownSearchBox {...mockProps} />);

    // Check for placeholder
    expect(getByText(mockProps.placeholder)).toBeInTheDocument();

    // Check for options
    mockItems.forEach(item => {
      expect(getByText(item)).toBeInTheDocument();
    });

    // Check dropdown role
    expect(getByRole('combobox')).toBeInTheDocument();
  });

  it('calls searchCallback with correct value on selection change', () => {
    const { getByRole } = render(<DropDownSearchBox {...mockProps} />);
    const select = getByRole('combobox');

    fireEvent.change(select, { target: { value: mockItems[1] } });

    expect(mockSearchCallback).toHaveBeenCalledWith(mockItems[1]);
  });
});
