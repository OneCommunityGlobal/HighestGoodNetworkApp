import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';

vi.mock('~/actions/kiCalendarAction', () => ({
  useGetKICalendarEventsQuery: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: () => ({}),
      theme: () => ({ darkMode: false }),
    },
  });

import * as api from '~/actions/kiCalendarAction';
import { toast } from 'react-toastify';
import KICalendar from './KICalendar';

describe('KICalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 9));
    api.useGetKICalendarEventsQuery.mockImplementation((args, options) => {
      const { month, year } = args;
      const currentData = [
        { id: 1, title: 'Current Event', date: '2026-02-09', type: 'Garden' },
        { id: 4, title: 'Current Event 2', date: '2026-02-09', type: 'Kitchen' },
      ];
      const prevData = [{ id: 2, title: 'Prev Event', date: '2026-01-31', type: 'Garden' }];
      const nextData = [{ id: 3, title: 'Next Event', date: '2026-03-01', type: 'Garden' }];

      if (month === 2 && year === 2026) {
        return { data: currentData, isLoading: false, isError: false };
      }

      if (month === 1 && year === 2026) {
        return { data: prevData, isLoading: false, isError: false };
      }

      if (month === 3 && year === 2026) {
        return { data: nextData, isLoading: false, isError: false };
      }

      return { data: [], isLoading: false, isError: false };
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Renders calendar header', () => {
    render(
      <Provider store={createTestStore()}>
        <KICalendar />
      </Provider>,
    );

    expect(screen.getByText('Unified Calendar')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Week')).toBeInTheDocument();
  });

  it('Calendar merges events from 3 months', () => {
    render(
      <Provider store={createTestStore()}>
        <KICalendar />
      </Provider>,
    );

    expect(screen.getAllByText('Current Event').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Prev Event').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Next Event').length).toBeGreaterThan(0);
  });

  it('Shows toast when API fails', () => {
    api.useGetKICalendarEventsQuery.mockImplementation((args, options) => {
      return { data: [], isLoading: false, isError: true };
    });

    render(
      <Provider store={createTestStore()}>
        <KICalendar />
      </Provider>,
    );

    expect(toast.error).toHaveBeenCalledWith('Failed to load calendar events. Using demo data.');
  });

  it('Switches to week view when Week clicked', () => {
    render(
      <Provider store={createTestStore()}>
        <KICalendar />
      </Provider>,
    );

    fireEvent.click(screen.getByText('Week'));

    expect(screen.getByTestId('week-calendar')).toBeInTheDocument();
    expect(screen.queryByTestId('month-calendar')).not.toBeInTheDocument();
  });

  it('Filters events by module', () => {
    render(
      <Provider store={createTestStore()}>
        <KICalendar />
      </Provider>,
    );

    fireEvent.click(screen.getByTestId('modules-filter-dropdown'));
    fireEvent.click(screen.getByTestId('filter-garden'));

    expect(screen.queryAllByText('Current Event').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Current Event 2').length).toBe(0);
  });

  it('Opens modal when event clicked', () => {
    render(
      <Provider store={createTestStore()}>
        <KICalendar />
      </Provider>,
    );

    fireEvent.click(screen.getByTestId('event-1'));

    expect(screen.getByTestId('event-modal')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('event-modal')).getByText('Current Event'),
    ).toBeInTheDocument();
  });
});
