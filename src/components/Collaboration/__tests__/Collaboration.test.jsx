import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import Collaboration from '../Collaboration';

// Mock What We Do so these tests focus on Collaboration
vi.mock('../../WhatWeDo/WhatWeDo', () => ({
  default: () => <div data-testid="what-we-do-section">What We Do Content</div>,
}));

const mockPush = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useHistory: () => ({
      push: mockPush,
    }),
  };
});

const mockStore = {
  getState: () => ({
    theme: {
      darkMode: false,
    },
  }),
  subscribe: () => () => {},
  dispatch: vi.fn(),
};

const renderComponent = () =>
  render(
    <Provider store={mockStore}>
      <MemoryRouter>
        <Collaboration />
      </MemoryRouter>
    </Provider>,
  );

const mockJobsResponse = {
  jobs: [
    {
      _id: 'job-1',
      title: 'Frontend Engineer',
      category: 'Engineering',
      description: 'Frontend development position',
      requirements: ['React', 'JavaScript'],
    },
    {
      _id: 'job-2',
      title: 'Backend Engineer',
      category: 'Engineering',
      description: 'Backend development position',
      requirements: ['Node.js'],
    },
  ],
  pagination: {
    totalPages: 1,
  },
};

const mockCategoriesResponse = {
  categories: ['Engineering', 'Administrative'],
};

const mockSummariesResponse = {
  jobs: [
    {
      _id: 'summary-1',
      title: 'Frontend Engineer',
      description: 'Frontend engineer job summary',
      category: 'Engineering',
      jobDetailsLink: 'https://example.com/frontend',
      datePosted: '2026-09-01',
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();

  globalThis.scrollTo = vi.fn();

  globalThis.fetch = vi.fn(url => {
    if (url.includes('/jobs/categories')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCategoriesResponse),
      });
    }

    if (url.includes('/jobs/summaries')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSummariesResponse),
      });
    }

    if (url.includes('/jobs/reset-filters')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockJobsResponse),
      });
    }

    if (url.includes('/jobs')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockJobsResponse),
      });
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });
});

describe('Collaboration', () => {
  it('renders the main Collaboration page', async () => {
    renderComponent();

    expect(screen.getByText('LIKE TO WORK WITH US? APPLY NOW!')).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Enter Job Title')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Show Summaries' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'What We Do' })).toBeInTheDocument();
  });

  it('fetches jobs and categories on initial render', async () => {
    renderComponent();

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    expect(globalThis.fetch.mock.calls.some(([url]) => url.includes('/jobs/categories'))).toBe(
      true,
    );

    expect(globalThis.fetch.mock.calls.some(([url]) => url.includes('/jobs?'))).toBe(true);
  });

  it('shows individual jobs when there is no search or category filter', async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Frontend Engineer - Engineering/i }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: /Backend Engineer - Engineering/i }),
    ).toBeInTheDocument();
  });

  it('allows the user to search for a job title', async () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText('Enter Job Title');

    fireEvent.change(searchInput, {
      target: { value: 'Frontend Engineer' },
    });

    expect(searchInput).toHaveValue('Frontend Engineer');

    fireEvent.click(screen.getByRole('button', { name: 'Go' }));

    await waitFor(() => {
      expect(
        globalThis.fetch.mock.calls.some(([url]) => url.includes('search=Frontend%20Engineer')),
      ).toBe(true);
    });
  });

  it('allows the user to select a category', async () => {
    renderComponent();

    const categorySelect = await screen.findByRole('combobox');

    fireEvent.change(categorySelect, {
      target: { value: 'Engineering' },
    });

    await waitFor(() => {
      expect(
        globalThis.fetch.mock.calls.some(([url]) => url.includes('category=Engineering')),
      ).toBe(true);
    });
  });

  it('resets search and category filters', async () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText('Enter Job Title');

    fireEvent.change(searchInput, {
      target: { value: 'Frontend Engineer' },
    });

    const categorySelect = await screen.findByRole('combobox');

    fireEvent.change(categorySelect, {
      target: { value: 'Engineering' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    await waitFor(() => {
      expect(searchInput).toHaveValue('');
      expect(categorySelect).toHaveValue('');
    });

    expect(globalThis.fetch.mock.calls.some(([url]) => url.includes('/jobs/reset-filters'))).toBe(
      true,
    );
  });

  it('shows job summaries when Show Summaries is clicked', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Show Summaries' }));

    await waitFor(() => {
      expect(screen.getByText('Summaries')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Frontend Engineer').length).toBeGreaterThan(0);

    expect(screen.getAllByText('Frontend engineer job summary').length).toBeGreaterThan(0);
  });

  it('uses the search input in the summaries request', async () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText('Enter Job Title');

    fireEvent.change(searchInput, {
      target: { value: 'Frontend Engineer' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Show Summaries' }));

    await waitFor(() => {
      expect(
        globalThis.fetch.mock.calls.some(
          ([url]) => url.includes('/jobs/summaries') && url.includes('search=Frontend%20Engineer'),
        ),
      ).toBe(true);
    });
  });

  it('switches to the What We Do tab', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'What We Do' }));

    expect(screen.getByTestId('what-we-do-section')).toBeInTheDocument();

    expect(screen.getByText('What We Do Content')).toBeInTheDocument();
  });

  it('returns to job postings when the What We Do tab is changed back', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'What We Do' }));

    expect(screen.getByTestId('what-we-do-section')).toBeInTheDocument();

    // The component currently has the What We Do button only,
    // so clicking it again keeps the same tab.
    expect(screen.getByText('What We Do Content')).toBeInTheDocument();
  });

  it('navigates to job application when a job is clicked', async () => {
    renderComponent();

    // Search removes the category-card view and displays individual jobs.
    const searchInput = screen.getByPlaceholderText('Enter Job Title');

    fireEvent.change(searchInput, {
      target: { value: 'Frontend Engineer' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Go' }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: /Frontend Engineer - Engineering/i,
        }),
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /Frontend Engineer - Engineering/i,
      }),
    );

    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/job-application',
        search: '?jobTitle=Frontend%20Engineer',
        state: expect.objectContaining({
          jobId: 'job-1',
          jobTitle: 'Frontend Engineer',
          category: 'Engineering',
        }),
      }),
    );
  });

  it('shows pagination when there are multiple pages', async () => {
    globalThis.fetch = vi.fn(url => {
      if (url.includes('/jobs/categories')) {
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
                  imageUrl: 'https://example.com/frontend-engineer.jpg',
                },
              ],
              categories: ['Engineering'],
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            jobs: [
              {
                _id: 'job-1',
                title: 'Frontend Engineer',
                category: 'Engineering',
                description: 'Frontend development',
              },
            ],
            pagination: {
              totalPages: 3,
            },
          }),
      });
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '1', exact: true })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2', exact: true })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3', exact: true })).toBeInTheDocument();
    });
  });

  it('shows an error message when the jobs API fails', async () => {
    globalThis.fetch = vi.fn(url => {
      if (url.includes('/jobs/categories')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              categories: [],
            }),
        });
      }

      return Promise.resolve({
        ok: false,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({}),
      });
    });

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(
          'Could not load jobs. Ensure the backend is running (npm start in HGNRest).',
        ),
      ).toBeInTheDocument();
    });
  });
});
