import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Collaboration from '../Collaboration';
import { ApiEndpoint } from '~/utils/URL';
import { vi } from 'vitest';

// Mock Redux
vi.mock('react-redux', () => ({
  useSelector: vi.fn(fn => fn({ theme: { darkMode: false } })),
}));

// Mock toast
vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

// Mock fetch
global.fetch = vi.fn();

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

      if (url.includes('/jobs?')) {
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

      return { ok: true, json: async () => ({}) };
    });
  });

  /* ================= BASIC RENDER ================= */

  test('renders logo', () => {
    render(<Collaboration />);
    expect(screen.getByAltText('One Community Logo')).toBeInTheDocument();
  });

  test('fetches categories and jobs on mount', async () => {
    render(<Collaboration />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`${ApiEndpoint}/jobs/categories`);
    });

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/jobs?'));
  });

  /* ================= SEARCH ================= */

  test('search input updates value', () => {
    render(<Collaboration />);

    const input = screen.getByPlaceholderText('Search by title...');
    fireEvent.change(input, { target: { value: 'engineer' } });

    expect(input.value).toBe('engineer');
  });

  test('submitting search triggers fetch', async () => {
    render(<Collaboration />);

    fireEvent.change(screen.getByPlaceholderText('Search by title...'), {
      target: { value: 'engineer' },
    });

    fireEvent.click(screen.getByText('Go'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  /* ================= CATEGORY DROPDOWN ================= */

  test('category dropdown opens and selects category', async () => {
    render(<Collaboration />);

    fireEvent.click(screen.getByRole('button', { name: /select categories/i }));

    const category = await screen.findByRole('button', { name: 'Engineering' });
    fireEvent.click(category);

    await waitFor(() => {
      expect(screen.getAllByText('Engineering').length).toBeGreaterThan(0);
    });
  });

  /* ================= POSITION DROPDOWN ================= */

  test('position dropdown disabled until category selected', () => {
    render(<Collaboration />);

    const btn = screen.getByRole('button', { name: /select positions/i });
    expect(btn).toBeDisabled();
  });

  test('can select a position after selecting category', async () => {
    render(<Collaboration />);

    // Select category
    fireEvent.click(screen.getByRole('button', { name: /select categories/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Engineering' }));

    // Open position dropdown
    const positionButton = screen.getByRole('button', { name: /select positions/i });
    expect(positionButton).not.toBeDisabled();

    fireEvent.click(positionButton);

    // ✅ Get ALL matching buttons
    const options = await screen.findAllByRole('button', {
      name: 'Frontend Engineer',
    });

    // ✅ Pick the dropdown one (not job card)
    const dropdownOption = options.find(el => el.className.includes('dropdownItem'));

    fireEvent.click(dropdownOption);

    const nav = screen.getByRole('navigation');

    expect(within(nav).getByRole('button', { name: /frontend engineer/i })).toBeInTheDocument();
  });

  /* ================= PAGINATION ================= */

  test('pagination renders correctly', async () => {
    render(<Collaboration />);

    await waitFor(() => {
      expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
    });

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  /* ================= MODAL ================= */

  test('clicking job opens modal', async () => {
    render(<Collaboration />);

    const job = await screen.findByRole('heading', {
      name: 'Frontend Engineer',
    });

    fireEvent.click(job);

    await waitFor(() => {
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  test('modal closes on close button click', async () => {
    render(<Collaboration />);

    fireEvent.click(await screen.findByRole('heading', { name: 'Frontend Engineer' }));

    fireEvent.click(await screen.findByLabelText(/close role details/i));

    await waitFor(() => {
      expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    });
  });

  /* ================= SUMMARIES ================= */

  test('Show Summaries triggers API and switches view', async () => {
    render(<Collaboration />);

    fireEvent.click(screen.getByText('Show Summaries'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/jobs/summaries'));
    });

    expect(screen.getByText('Job Summaries')).toBeInTheDocument();
  });

  /* ================= CLEAR FILTER ================= */

  test('clear filters resets UI', async () => {
    render(<Collaboration />);

    fireEvent.click(screen.getByRole('button', { name: /select categories/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Engineering' }));

    fireEvent.click(await screen.findByText('Clear All'));

    await waitFor(() => {
      expect(screen.getByText('Listing all job ads.')).toBeInTheDocument();
    });
  });
});
