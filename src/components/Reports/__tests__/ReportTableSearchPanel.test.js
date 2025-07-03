// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ReportTableSearchPanel from '../ReportTableSearchPanel';

describe('<ReportTableSearchPanel />', () => {
  const mockStore = configureStore([]);
  const initialState = {
    theme: { darkMode: false },
  };
  const store = mockStore(initialState);

  test('renders search input', () => {
    render(<Provider store={store}><ReportTableSearchPanel onSearch={jest.fn()} /></Provider>);
    const inputElement = screen.getByPlaceholderText('Search Text');
    expect(inputElement).toBeInTheDocument();
  });

  test('calls onSearch prop on button click', () => {
    const onSearchMock = jest.fn();
    render(<Provider store={store}><ReportTableSearchPanel onSearch={onSearchMock} /></Provider>);
    const inputElement = screen.getByPlaceholderText('Search Text');
    fireEvent.change(inputElement, { target: { value: 'test' } });
    const button = screen.getByRole('button', { name: /search/i });
    fireEvent.click(button);
    expect(onSearchMock).toHaveBeenCalledTimes(1);
    expect(onSearchMock).toHaveBeenCalledWith('test');
  });

  test('calls onSearch prop on Enter key', () => {
    const onSearchMock = jest.fn();
    render(<Provider store={store}><ReportTableSearchPanel onSearch={onSearchMock} /></Provider>);
    const inputElement = screen.getByPlaceholderText('Search Text');
    fireEvent.change(inputElement, { target: { value: 'test' } });
    fireEvent.keyDown(inputElement, { key: 'Enter', code: 'Enter' });
    expect(onSearchMock).toHaveBeenCalledTimes(1);
    expect(onSearchMock).toHaveBeenCalledWith('test');
  });

  test('input should be auto-focused on render', () => {
    render(<Provider store={store}><ReportTableSearchPanel onSearch={jest.fn()} /></Provider>);
    const inputElement = screen.getByPlaceholderText('Search Text');
    expect(document.activeElement).toEqual(inputElement);
  });

  test('does not call onSearch prop when input is empty', () => {
    const onSearchMock = jest.fn();
    render(<Provider store={store}><ReportTableSearchPanel onSearch={onSearchMock} /></Provider>);
    const inputElement = screen.getByPlaceholderText('Search Text');
    fireEvent.change(inputElement, { target: { value: '' } });
    expect(onSearchMock).not.toHaveBeenCalled();
  });

  test('does not call onSearch prop on input change', () => {
    const onSearchMock = jest.fn();
    render(<Provider store={store}><ReportTableSearchPanel onSearch={onSearchMock} /></Provider>);
    const inputElement = screen.getByPlaceholderText('Search Text');
    fireEvent.change(inputElement, { target: { value: 'a' } });
    fireEvent.change(inputElement, { target: { value: 'ab' } });
    fireEvent.change(inputElement, { target: { value: 'abc' } });
    expect(onSearchMock).not.toHaveBeenCalled();
  });

});
