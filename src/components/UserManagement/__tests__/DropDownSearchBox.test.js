// import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
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
  const mockStore = configureStore([]);
    const initialState = {
      theme: { darkMode: false },
    };
    const store = mockStore(initialState);

  it('renders with correct options', () => {
    const { getByRole, getByText } = render(<Provider store={store}><DropDownSearchBox {...mockProps} /></Provider>);

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
    const { getByRole } = render(<Provider store={store}><DropDownSearchBox {...mockProps} /></Provider>);
    const select = getByRole('combobox');

    fireEvent.change(select, { target: { value: mockItems[1] } });

    expect(mockSearchCallback).toHaveBeenCalledWith(mockItems[1]);
  });
});
