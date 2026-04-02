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

      if (url.includes('/jobs/positions')) {
        return { ok: true, json: async () => ({ positions: ['Frontend Engineer'] }) };
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

  test('search updates input and triggers fetch', async () => {
    render(<Collaboration />);

    const input = screen.getByPlaceholderText('Search by title...');

    fireEvent.change(input, { target: { value: 'engineer' } });
    expect(input.value).toBe('engineer');

    fireEvent.click(screen.getByText('Go'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  /* ================= CATEGORY ================= */

  test('select category updates UI', async () => {
    render(<Collaboration />);

    fireEvent.click(screen.getByText('Select Categories ▼'));

    const category = await screen.findByText('Engineering');
    fireEvent.click(category);

    expect(screen.getByText('Engineering ▼')).toBeInTheDocument();
  });

  /* ================= POSITION ================= */

  test('select position after selecting category', async () => {
    render(<Collaboration />);

    // Select category first
    fireEvent.click(screen.getByText('Select Categories ▼'));
    fireEvent.click(await screen.findByText('Engineering'));

    // Open positions dropdown
    fireEvent.click(screen.getByText('Select Positions ▼'));

    // Find dropdown container WITHOUT DOM traversal
    const dropdownContainer = await screen.findByText('Frontend Engineer');

    // Click directly on option (now visible)
    fireEvent.click(dropdownContainer);

    expect(screen.getByText('Frontend Engineer ▼')).toBeInTheDocument();
  });

  /* ================= JOB CLICK ================= */

  test('opens job modal on click', async () => {
    render(<Collaboration />);

    const job = await screen.findByText('Frontend Engineer');
    fireEvent.click(job);

    expect(await screen.findByText('Test description')).toBeInTheDocument();
  });

  test('closes job modal', async () => {
    render(<Collaboration />);

    fireEvent.click(await screen.findByText('Frontend Engineer'));

    fireEvent.click(await screen.findByText('×'));

    await waitFor(() => {
      expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    });
  });

  /* ================= CLEAR FILTER ================= */

  test('clear all filters resets UI', async () => {
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

  test('fetch summaries and display', async () => {
    render(<Collaboration />);

    fireEvent.click(screen.getByText('Show Summaries'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/jobs/summaries'));
    });
  });
});
