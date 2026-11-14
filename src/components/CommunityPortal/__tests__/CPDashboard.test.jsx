import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CPDashboard from '../CPDashboard';

vi.mock('axios');

const mockStore = configureMockStore([]);

const renderDashboard = darkMode => {
  const store = mockStore({ theme: { darkMode } });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <CPDashboard />
      </MemoryRouter>
    </Provider>,
  );
};

describe('CPDashboard date filter', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 29, 23, 30));
    axios.get.mockClear();
    axios.get.mockResolvedValue({ data: { events: [] } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    { darkMode: false, mode: 'light' },
    { darkMode: true, mode: 'dark' },
  ])('sets today as the earliest date in $mode mode', async ({ darkMode }) => {
    renderDashboard(darkMode);

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    const dateInput = screen.getByPlaceholderText('Select Date');
    expect(dateInput).toHaveAttribute('min', '2026-10-29');
  });
});
