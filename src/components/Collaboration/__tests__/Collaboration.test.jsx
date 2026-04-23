import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Collaboration from '../Collaboration';

const mockStore = configureStore({
  reducer: {
    theme: () => ({ darkMode: false }),
  },
});

const renderWithProviders = ui => {
  return render(<Provider store={mockStore}>{ui}</Provider>);
};

describe('Collaboration Component', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(url => {
        const urlString = url.toString();

        if (urlString.includes('/jobs/categories')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ categories: ['Engineering'] }),
          });
        }

        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              jobs: [
                {
                  _id: '1',
                  title: 'Frontend Engineer',
                  category: 'Engineering',
                  description: 'Build UI components',
                },
              ],
            }),
        });
      }),
    );
  });

  it('renders main heading and initial jobs', async () => {
    renderWithProviders(<Collaboration />);
    expect(await screen.findByText(/LIKE TO WORK WITH US/i)).toBeInTheDocument();

    // Using regex to handle potential element splitting
    expect(await screen.findByText(/Frontend Engineer/i)).toBeInTheDocument();
  });

  it('updates search term on form submission', async () => {
    renderWithProviders(<Collaboration />);

    const input = screen.getByPlaceholderText(/search by title/i);
    fireEvent.change(input, { target: { value: 'React' } });

    // FIX: Using exact string 'Go' instead of regex /go/i to avoid
    // matching 'Select Categories' and adhering to no-node-access
    const goButton = screen.getByRole('button', { name: 'Go' });
    fireEvent.click(goButton);

    // Verify that the search parameter was included in at least one fetch call
    await waitFor(() => {
      const calls = vi.mocked(global.fetch).mock.calls;
      const hasSearchCall = calls.some(call => call[0].includes('search=React'));
      expect(hasSearchCall).toBe(true);
    });
  });

  it('switches to summaries view and back', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(url => {
        if (url.includes('/summaries')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                jobs: [{ _id: 's1', title: 'Summary Job', description: 'Quick summary' }],
              }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ jobs: [] }) });
      }),
    );

    renderWithProviders(<Collaboration />);

    const summariesBtn = screen.getByText(/Show Summaries/i);
    fireEvent.click(summariesBtn);

    expect(await screen.findByText('Job Summaries')).toBeInTheDocument();

    const backBtn = screen.getByText(/Back to Job Listings/i);
    fireEvent.click(backBtn);

    expect(await screen.findByText(/LIKE TO WORK WITH US/i)).toBeInTheDocument();
  });
});
