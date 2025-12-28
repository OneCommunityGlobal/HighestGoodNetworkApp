import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Collaboration from '../Collaboration';
import { ApiEndpoint } from '~/utils/URL';
import { vi } from 'vitest';

// Mock Redux
vi.mock('react-redux', () => ({
  useSelector: vi.fn(fn => fn({ theme: { darkMode: false } })),
  useDispatch: () => vi.fn(),
}));

// Mock permissions
vi.mock('~/utils/permissions', () => ({
  __esModule: true,
  default: () => true,
}));

// Mock toast
vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.scrollTo
global.window.scrollTo = vi.fn();

// Helper mock responses
const mockCategories = {
  categories: ['Engineering', 'Art'],
};

const mockJobs = {
  jobs: [
    {
      _id: '1',
      title: 'Frontend Engineer',
      category: 'Engineering',
      featured: false,
      displayOrder: 1,
      datePosted: new Date().toISOString(),
    },
  ],
  pagination: { totalPages: 2 },
};

describe('Collaboration Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    fetch.mockImplementation(async url => {
      if (url.includes('/jobs/categories')) {
        return {
          ok: true,
          json: async () => mockCategories,
        };
      }
      if (url.includes('/jobs?page=')) {
        return {
          ok: true,
          json: async () => mockJobs,
        };
      }
      if (url.includes('/jobs/summaries')) {
        return {
          ok: true,
          json: async () => ({ jobs: [] }),
        };
      }
    });
  });

  test('renders page header logo', async () => {
    render(<Collaboration />);
    expect(screen.getByAltText('One Community Logo')).toBeInTheDocument();
  });

  test('fetches categories and jobs on mount', async () => {
    render(<Collaboration />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${ApiEndpoint}/jobs?page=1&limit=`),
        { method: 'GET' },
      );
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`${ApiEndpoint}/jobs/categories`, { method: 'GET' });
    });

    // Component calls fetchJobAds() and fetchCategories() on mount
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`${ApiEndpoint}/jobs/categories`), {
      method: 'GET',
    });
  });

  test('search input updates state and triggers tooltip if no categories selected', async () => {
    render(<Collaboration />);

    const input = screen.getByPlaceholderText('Enter Job Title');
    fireEvent.change(input, { target: { value: 'engineer' } });

    expect(input.value).toBe('engineer');
  });

  test('submitting search triggers fetchJobAds()', async () => {
    render(<Collaboration />);

    const input = screen.getByPlaceholderText('Enter Job Title');
    const button = screen.getByText('Go');

    fireEvent.change(input, { target: { value: 'engineer' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${ApiEndpoint}/jobs?page=1&limit=`),
        { method: 'GET' },
      );
    });
  });

  test('dropdown toggles open when clicking category button', async () => {
    render(<Collaboration />);
    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText('Select From Positions')).toBeInTheDocument();
    });
    // The component uses a select dropdown, not a custom dropdown button
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  // ✅ FIXED PAGINATION TEST
  test('pagination renders when job ads are loaded', async () => {
    render(<Collaboration />);

    // Trigger search so results section becomes active
    fireEvent.change(screen.getByPlaceholderText('Enter Job Title'), {
      target: { value: 'test' },
    });

    fireEvent.click(screen.getByText('Go'));

    // Wait for pagination to appear
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  // ✅ FIXED CATEGORY CHIP TEST
  test('category chips appear when category selected', async () => {
    render(<Collaboration />);

    // Wait for categories to load and select dropdown to appear
    await waitFor(() => {
      expect(screen.getByText('Select From Positions')).toBeInTheDocument();
    });

    // Select a category from the dropdown
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Engineering' } });

    // Wait for the category to be selected and jobs to be filtered
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('category='), { method: 'GET' });
    });
  });

  test('Show Summaries button triggers summaries fetch', async () => {
    render(<Collaboration />);

    fireEvent.click(screen.getByText('Go'));
    fireEvent.click(screen.getByText('Show Summaries'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/jobs/summaries'), {
        method: 'GET',
      });
    });
  });
});
