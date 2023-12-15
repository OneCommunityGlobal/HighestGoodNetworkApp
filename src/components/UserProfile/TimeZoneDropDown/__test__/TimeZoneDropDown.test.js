import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TimeZoneDropDown from '../TimeZoneDropDown';

describe('TimeZoneDropDown Component', () => {
  const mockOnChange = jest.fn();
  const timeZones = {
    'America/New_York': { utcOffset: '-05:00' },
    'Europe/London': { utcOffset: '+00:00' },
    'Asia/Tokyo': { utcOffset: '+09:00' }
  };

  it('renders with default props', () => {
    render(<TimeZoneDropDown onChange={mockOnChange} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with a selected time zone', () => {
    render(<TimeZoneDropDown selected='Europe/London' onChange={mockOnChange} />);
    expect(screen.getByRole('combobox')).toHaveValue('Europe/London');
  });

  it('filters time zones based on filter prop', () => {
    render(<TimeZoneDropDown filter='London' onChange={mockOnChange} />);
    expect(screen.queryByText(/America\/New_York/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Europe\/London/)).toBeInTheDocument();
  });

  it('calls onChange when a different time zone is selected', () => {
    render(<TimeZoneDropDown onChange={mockOnChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Asia/Tokyo' } });
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('dispatches change event when filter prop changes', () => {
    const { rerender } = render(<TimeZoneDropDown filter='' onChange={mockOnChange} />);
    rerender(<TimeZoneDropDown filter='Tokyo' onChange={mockOnChange} />);
    expect(mockOnChange).toHaveBeenCalled();
  });
});
