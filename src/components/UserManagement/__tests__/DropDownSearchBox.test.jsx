// import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import DropDownSearchBox from '../DropDownSearchBox';

describe('DropDownSearchBox', () => {
  const mockSearchCallback = vi.fn();
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
  const mockStore = configureMockStore([]);
    const initialState = {
      theme: { darkMode: false },
    };
    const store = mockStore(initialState);

  it('renders with correct options', () => {
    const { getByRole, getByText } = render(<Provider store={store}><DropDownSearchBox 
      id={mockProps.id}
      placeholder={mockProps.placeholder}
      items={mockItems}
      searchCallback={mockSearchCallback}
      value={mockProps.value}
      width={mockProps.width}
      className={mockProps.className}
      />
      </Provider>);

    // Check for placeholder
    expect(screen.getByText(mockProps.placeholder)).toBeInTheDocument();

    // Check for options
    mockItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });

    // Check dropdown role
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls searchCallback with correct value on selection change', () => {
    const { getByRole } = render(<Provider store={store}><DropDownSearchBox 
        id={mockProps.id}
        placeholder={mockProps.placeholder}
        items={mockItems}
        searchCallback={mockSearchCallback}
        value={mockProps.value}
        width={mockProps.width}
        className={mockProps.className}
    />
    </Provider>);
    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: mockItems[1] } });

    expect(mockSearchCallback).toHaveBeenCalledWith(mockItems[1]);
  });
});
