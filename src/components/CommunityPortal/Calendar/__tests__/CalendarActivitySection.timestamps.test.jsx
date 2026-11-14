import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import CalendarActivitySection from '../CalendarActivitySection';

const mockStore = configureMockStore([]);

const renderSection = () =>
  render(
    <Provider store={mockStore({ theme: { darkMode: false } })}>
      <CalendarActivitySection selectedDate={null} events={[]} onEventClick={() => {}} />
    </Provider>,
  );

describe('CalendarActivitySection - Latest News timestamps', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 5, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates the relative labels as time passes', () => {
    renderSection();
    expect(screen.getByText('2 min ago')).toBeInTheDocument();
    expect(screen.getByText('1 hour ago')).toBeInTheDocument();
    expect(screen.getByText('3 hours ago')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000);
    });

    expect(screen.queryByText('2 min ago')).not.toBeInTheDocument();
    expect(screen.getByText('1 hour ago')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('4 hours ago')).toBeInTheDocument();
  });
});
