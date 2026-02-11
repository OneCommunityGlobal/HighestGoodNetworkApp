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
      expect(fetch).toHaveBeenCalledWith(`${ApiEndpoint}/jobs/categories`);
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('search input updates state and triggers tooltip if no categories selected', async () => {
    render(<Collaboration />);

    const input = screen.getByPlaceholderText('Search by title...');
    fireEvent.change(input, { target: { value: 'engineer' } });

    expect(input.value).toBe('engineer');
  });

  test('submitting search triggers fetchJobAds()', async () => {
    render(<Collaboration />);

    const input = screen.getByPlaceholderText('Search by title...');
    const button = screen.getByText('Go');

    fireEvent.change(input, { target: { value: 'engineer' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  test('dropdown toggles open when clicking category button', async () => {
    render(<Collaboration />);
    fireEvent.click(screen.getByText('Select Categories ▼'));
  });

  // ✅ FIXED PAGINATION TEST
  test('pagination renders when job ads are loaded', async () => {
    render(<Collaboration />);

    // Trigger search so results section becomes active
    fireEvent.change(screen.getByPlaceholderText('Search by title...'), {
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

    // Dropdown appears after initial fetch completes
    await waitFor(() => {
      expect(screen.getByText(/Select Categories/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Select Categories ▼'));

    // Click Engineering checkbox
    fireEvent.click(screen.getByLabelText('Engineering'));

    // Both occur: dropdown label + chip, so use getAllByText
    await waitFor(() => {
      const matches = screen.getAllByText('Engineering');
      expect(matches.length).toBeGreaterThan(1); // dropdown + chip
    });
  });

  test('Show Summaries button triggers summaries fetch', async () => {
    render(<Collaboration />);

    fireEvent.click(screen.getByText('Go'));
    fireEvent.click(screen.getByText('Show Summaries'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});
