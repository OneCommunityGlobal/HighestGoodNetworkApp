import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import Collaboration from '../Collaboration';
import { ApiEndpoint } from '~/utils/URL';

/* ================= MOCKS ================= */

vi.mock('react-redux', () => ({
  useSelector: vi.fn(fn => fn({ theme: { darkMode: false } })),
}));

vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

global.fetch = vi.fn();

/* ================= TEST DATA ================= */

const mockCategories = {
  categories: ['Engineering', 'Art'],
};

const mockJobs = {
  jobs: [
    {
      _id: '1',
      title: 'Frontend Engineer',
      category: 'Engineering',
      position: 'Frontend Engineer',
      description: 'Test description',
    },
  ],
};

/* ================= TEST SUITE ================= */

describe('Collaboration Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    fetch.mockImplementation(async url => {
      if (url.includes('/jobs/categories')) {
        return { ok: true, json: async () => mockCategories };
      }

      if (url.includes('/jobs?')) {
        return { ok: true, json: async () => mockJobs };
      }

      if (url.includes('/jobs/summaries')) {
        return { ok: true, json: async () => ({ jobs: [] }) };
      }

      return { ok: true, json: async () => ({}) };
    });
  });

  /* ================= BASIC ================= */

  test('renders logo', () => {
    render(<Collaboration />);
    expect(screen.getByAltText('One Community Logo')).toBeInTheDocument();
  });

  test('fetches categories on mount', async () => {
    render(<Collaboration />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`${ApiEndpoint}/jobs/categories`);
    });
  });

  /* ================= SEARCH ================= */

  test('search input updates', () => {
    render(<Collaboration />);

    const input = screen.getByPlaceholderText('Search by title...');
    fireEvent.change(input, { target: { value: 'engineer' } });

    expect(input.value).toBe('engineer');
  });

  test('search triggers API call', async () => {
    render(<Collaboration />);

    const input = screen.getByPlaceholderText('Search by title...');
    fireEvent.change(input, { target: { value: 'engineer' } });

    fireEvent.click(screen.getByText('Go'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  /* ================= CATEGORY ================= */

  test('select category', async () => {
    render(<Collaboration />);

    fireEvent.click(screen.getByText('Select Categories ▼'));

    const category = await screen.findByText('Engineering');
    fireEvent.click(category);

    expect(screen.getByText('Engineering ▼')).toBeInTheDocument();
  });

  /* ================= POSITION (FIXED) ================= */

  test('select position after category', async () => {
    render(<Collaboration />);

    fireEvent.click(screen.getByText('Select Categories ▼'));
    fireEvent.click(await screen.findByText('Engineering'));

    fireEvent.click(screen.getByText('Select Positions ▼'));

    const dropdown = screen.getByTestId('positions-dropdown');

    fireEvent.click(within(dropdown).getByText('Frontend Engineer'));

    expect(screen.getByText('Frontend Engineer ▼')).toBeInTheDocument();
  });

  /* ================= JOB MODAL ================= */

  test('opens job modal', async () => {
    render(<Collaboration />);

    const job = await screen.findByText('Frontend Engineer');
    fireEvent.click(job);

    expect(await screen.findByText('Test description')).toBeInTheDocument();
  });

  test('closes job modal', async () => {
    render(<Collaboration />);

    fireEvent.click(await screen.findByText('Frontend Engineer'));

    fireEvent.click(await screen.findByText(/close/i));

    await waitFor(() => {
      expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    });
  });

  /* ================= CLEAR FILTER ================= */

  test('clear filters resets UI', async () => {
    render(<Collaboration />);

    fireEvent.click(screen.getByText('Select Categories ▼'));
    fireEvent.click(await screen.findByText('Engineering'));

    fireEvent.click(screen.getByText('Clear All'));

    expect(screen.getByText('Listing all job ads.')).toBeInTheDocument();
  });

  /* ================= PAGINATION ================= */

  test('pagination renders', async () => {
    render(<Collaboration />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  /* ================= SUMMARIES ================= */

  test('toggle summaries triggers fetch', async () => {
    render(<Collaboration />);

    fireEvent.click(screen.getByText('Show Summaries'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/jobs/summaries'));
    });
  });
});
