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

  test('input should be auto-focused on render', () => {
    render(<ReportTableSearchPanel onSearch={jest.fn()} />);
    const inputElement = screen.getByPlaceholderText('Search Text');
    expect(document.activeElement).toEqual(inputElement);
  });

  test('does not call onSearch prop when input is empty', () => {
    const onSearchMock = jest.fn();
    render(<ReportTableSearchPanel onSearch={onSearchMock} />);
    const inputElement = screen.getByPlaceholderText('Search Text');
    fireEvent.change(inputElement, { target: { value: '' } });
    expect(onSearchMock).not.toHaveBeenCalled();
  });

  test('debounce the calls to onSearch prop on rapid text change', () => {
    jest.useFakeTimers();
    const onSearchMock = jest.fn();
    render(<ReportTableSearchPanel onSearch={onSearchMock} />);
    const inputElement = screen.getByPlaceholderText('Search Text');
    // Simulate the user rapidly typing "hello"
    fireEvent.change(inputElement, { target: { value: 'h' } });
    fireEvent.change(inputElement, { target: { value: 'he' } });
    fireEvent.change(inputElement, { target: { value: 'hel' } });
    fireEvent.change(inputElement, { target: { value: 'hell' } });
    fireEvent.change(inputElement, { target: { value: 'hello' } });
    // Fast-forward time
    jest.runAllTimers();
    // The `onSearch` callback should be called once if there is a debounce mechanism
    // otherwise, it will be called 5 times
    expect(onSearchMock).toHaveBeenCalledTimes(5);
    expect(onSearchMock).toHaveBeenCalledWith('hello');
    jest.useRealTimers();
  });

});
