import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReportTableSearchPanel from './components/Reports/ReportTableSearchPanel';

describe('<ReportTableSearchPanel />', () => {
  test('renders search input', () => {
    render(<ReportTableSearchPanel onSearch={jest.fn()} />);
    const inputElement = screen.getByPlaceholderText('Search Text');
    expect(inputElement).toBeInTheDocument();
  });

  test('calls onSearch prop on text change', () => {
    const onSearchMock = jest.fn();
    render(<ReportTableSearchPanel onSearch={onSearchMock} />);
    const inputElement = screen.getByPlaceholderText('Search Text');
    fireEvent.change(inputElement, { target: { value: 'test' } });
    expect(onSearchMock).toHaveBeenCalledTimes(1);
    expect(onSearchMock).toHaveBeenCalledWith('test');
  });

  // If you want to test the autofocus attribute
  test('input should be auto-focused on render', () => {
    render(<ReportTableSearchPanel onSearch={jest.fn()} />);
    const inputElement = screen.getByPlaceholderText('Search Text');
    expect(document.activeElement).toEqual(inputElement);
  });
});
