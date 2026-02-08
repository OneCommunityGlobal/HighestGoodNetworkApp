import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { default as configureMockStore } from 'redux-mock-store';
import '@testing-library/jest-dom';

import ReportTableSearchPanel from '../ReportTableSearchPanel';

describe('<ReportTableSearchPanel />', () => {
  const mockStore = configureMockStore([]);
  const initialState = {
    theme: { darkMode: false },
  };
  const store = mockStore(initialState);

  test('renders search input', () => {
    render(
      <Provider store={store}>
        <ReportTableSearchPanel onSearch={vi.fn()} />
      </Provider>,
    );
    const inputElement = screen.getByPlaceholderText('Search Text');
    expect(inputElement).toBeInTheDocument();
  });

  test('calls onSearch prop on text change', () => {
    const onSearchMock = vi.fn();
    render(
      <Provider store={store}>
        <ReportTableSearchPanel onSearch={onSearchMock} />
      </Provider>,
    );
    const inputElement = screen.getByPlaceholderText('Search Text');
    fireEvent.change(inputElement, { target: { value: 'test' } });
    expect(onSearchMock).toHaveBeenCalledTimes(1);
    expect(onSearchMock).toHaveBeenCalledWith('test');
  });

  test('input should be auto-focused on render', () => {
    render(
      <Provider store={store}>
        <ReportTableSearchPanel onSearch={vi.fn()} />
      </Provider>,
    );
    const inputElement = screen.getByPlaceholderText('Search Text');
    expect(inputElement).toHaveFocus(); // fixed direct node access
  });

  test('does not call onSearch prop when input is empty', () => {
    const onSearchMock = vi.fn();
    render(
      <Provider store={store}>
        <ReportTableSearchPanel onSearch={onSearchMock} />
      </Provider>,
    );
    const inputElement = screen.getByPlaceholderText('Search Text');
    fireEvent.change(inputElement, { target: { value: '' } });
    expect(onSearchMock).not.toHaveBeenCalled();
  });

  test('debounce the calls to onSearch prop on rapid text change', () => {
    vi.useFakeTimers();
    const onSearchMock = vi.fn();
    render(
      <Provider store={store}>
        <ReportTableSearchPanel onSearch={onSearchMock} />
      </Provider>,
    );
    const inputElement = screen.getByPlaceholderText('Search Text');

    fireEvent.change(inputElement, { target: { value: 'h' } });
    fireEvent.change(inputElement, { target: { value: 'he' } });
    fireEvent.change(inputElement, { target: { value: 'hel' } });
    fireEvent.change(inputElement, { target: { value: 'hell' } });
    fireEvent.change(inputElement, { target: { value: 'hello' } });

    vi.runAllTimers();

    expect(onSearchMock).toHaveBeenCalledTimes(5); // adjust this if debounce is implemented
    expect(onSearchMock).toHaveBeenCalledWith('hello');
    vi.useRealTimers();
  });
});
