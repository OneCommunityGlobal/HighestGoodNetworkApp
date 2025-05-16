import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TimeZoneDropDown from '../TimeZoneDropDown';

describe('TimeZoneDropDown Component', () => {
  const mockStore = configureStore([]);
  const initialState = {
    theme: { darkMode: false },
  };
  const store = mockStore(initialState);

  const mockOnChange = jest.fn();
  const timeZones = {
    'America/New_York': { utcOffset: '-05:00' },
    'Europe/London': { utcOffset: '+00:00' },
    'Asia/Tokyo': { utcOffset: '+09:00' }
  };

  it('renders with default props (no props provided)', () => {
    render(<Provider store={store}><TimeZoneDropDown /></Provider>);
    expect(screen.getByTestId('time_zone_dropdown')).toBeInTheDocument();
  });

  it('renders with a selected time zone', () => {
    render(<Provider store={store}><TimeZoneDropDown selected='Europe/London' onChange={mockOnChange} /></Provider>);
    expect(screen.getByTestId('time_zone_dropdown')).toHaveValue('Europe/London');
  });

  it('filters time zones based on filter prop', () => {
    render(<Provider store={store}><TimeZoneDropDown filter='London' onChange={mockOnChange} /></Provider>);
    expect(screen.queryByText(/America\/New_York/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Europe\/London/)).toBeInTheDocument();
  });

  it('calls onChange when a different time zone is selected', () => {
    render(<Provider store={store}><TimeZoneDropDown onChange={mockOnChange} /></Provider>);
    fireEvent.change(screen.getByTestId('time_zone_dropdown'), { target: { value: 'Asia/Tokyo' } });
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('dispatches change event when filter prop changes', () => {
    const { rerender } = render(<Provider store={store}><TimeZoneDropDown filter='' onChange={mockOnChange} /></Provider>);
    rerender(<Provider store={store}><TimeZoneDropDown filter='Tokyo' onChange={mockOnChange} /></Provider>);
    expect(mockOnChange).toHaveBeenCalled();
  });

  test('handles incorrect filter provided', () => {
    render(<Provider store={store}><TimeZoneDropDown filter='123' /></Provider>);
    expect(screen.queryAllByTestId('time_zone_option')).toHaveLength(0);
  });

  test('handles invalid time zone names provided', () => {
    render(<Provider store={store}><TimeZoneDropDown selected="InvalidTimeZone" /></Provider>);
    expect(screen.getByTestId('time_zone_dropdown')).toHaveValue('Asia/Kabul');
  });
});
