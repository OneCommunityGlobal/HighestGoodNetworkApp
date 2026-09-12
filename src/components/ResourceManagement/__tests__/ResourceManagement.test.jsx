import { render, screen, fireEvent, within } from '@testing-library/react';
import ResourceManagement from '../ResourceManagement';

const fixture = vi.hoisted(() => ({ resources: [], darkMode: false }));
vi.mock('../MockData', () => ({
  get MOCK_RESOURCES() {
    return fixture.resources;
  },
}));
vi.mock('react-redux', () => ({
  useSelector: selector => selector({ theme: { darkMode: fixture.darkMode } }),
}));

const makeResources = count =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    user: `User ${String(index + 1).padStart(3, '0')}`,
    timeDuration: '01:00:00',
    facilities: index < 13 ? 'Workshop' : 'Office',
    materials: 'Wood',
    date: 'Jan 1, 2024',
    timestamp: 1704067200000 - index * 1000,
  }));
const clickPage = page =>
  fireEvent.click(screen.getByRole('button', { name: `Go to page ${page}` }));
const visibleUsers = () =>
  screen
    .queryAllByRole('checkbox', { name: /^Select User / })
    .map(checkbox => checkbox.getAttribute('aria-label').replace('Select ', ''));
const expectRange = (start, end, total = 243) => {
  expect(screen.getByRole('status')).toHaveTextContent(`Showing ${start}-${end} of ${total}`);
  expect(visibleUsers()).toEqual(
    makeResources(end)
      .slice(start - 1)
      .map(resource => resource.user),
  );
};

beforeEach(() => {
  fixture.resources = makeResources(243);
  fixture.darkMode = false;
});

describe('Resource Management pagination', () => {
  it('navigates next, previous, numbered and boundary pages with correct records', () => {
    render(<ResourceManagement />);
    expectRange(1, 10);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expectRange(11, 20);
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expectRange(1, 10);
    clickPage(4);
    expectRange(31, 40);
    clickPage(25);
    expectRange(241, 243);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expectRange(241, 243);
  });

  it.each([10, 25, 50, 100])('resets a later page when changing the page size to %i', size => {
    render(<ResourceManagement />);
    const selector = screen.getByRole('combobox', { name: 'Rows per page:' });
    expect(
      within(selector)
        .getAllByRole('option')
        .map(option => option.value),
    ).toEqual(['10', '25', '50', '100']);
    // Start with a different size so the 10-row case also exercises an actual change.
    fireEvent.change(selector, { target: { value: size === 10 ? '25' : '10' } });
    clickPage(size === 10 ? 10 : 25);
    fireEvent.change(selector, { target: { value: String(size) } });
    expectRange(1, size);
    expect(screen.getByRole('button', { name: 'Go to page 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    clickPage(Math.ceil(243 / size));
    expectRange(Math.floor(242 / size) * size + 1, 243);
  });

  it('resets on search and clear search while paginating the filtered results', () => {
    render(<ResourceManagement />);
    clickPage(25);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search resources' }), {
      target: { value: 'Workshop' },
    });
    expectRange(1, 10, 13);
    clickPage(2);
    expectRange(11, 13, 13);
    fireEvent.click(screen.getByRole('button', { name: 'Clear', exact: true }));
    expectRange(1, 10);
    expect(screen.getByRole('textbox', { name: 'Search resources' })).toHaveFocus();
  });

  it('resets on column sorting and global reversal with correctly ordered records', () => {
    render(<ResourceManagement />);
    clickPage(25);
    fireEvent.click(screen.getByRole('button', { name: /^User/ }));
    expectRange(1, 10);
    clickPage(25);
    fireEvent.click(screen.getByRole('button', { name: /^User/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1-10 of 243');
    expect(visibleUsers()).toEqual(
      makeResources(243)
        .slice(-10)
        .reverse()
        .map(resource => resource.user),
    );
    clickPage(25);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Global Sort Direction' }));
    expectRange(1, 10);
  });

  it('shows an unmatched-search message and restores results and focus when cleared', () => {
    render(<ResourceManagement />);
    clickPage(25);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search resources' }), {
      target: { value: 'not a resource' },
    });
    expect(screen.getByText('No matching resources')).toBeInTheDocument();
    expect(visibleUsers()).toEqual([]);
    expect(screen.getByRole('status')).toHaveTextContent('Showing 0-0 of 0');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expectRange(1, 10);
    expect(screen.getByRole('textbox', { name: 'Search resources' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Search resources' })).toHaveFocus();
    expect(screen.queryByText('No matching resources')).not.toBeInTheDocument();
  });

  it('handles an empty dataset including whitespace-only search', () => {
    fixture.resources = [];
    render(<ResourceManagement />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search resources' }), {
      target: { value: '   ' },
    });
    expect(screen.getByText('No resources available')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
    expect(visibleUsers()).toEqual([]);
    expect(screen.getByRole('status')).toHaveTextContent('Showing 0-0 of 0');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('handles a single page', () => {
    fixture.resources = makeResources(3);
    render(<ResourceManagement />);
    expectRange(1, 3, 3);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getAllByRole('button', { name: /^Go to page/ })).toHaveLength(1);
  });

  it.each([false, true])(
    'exposes accessible controls and live counts with dark mode %s',
    darkMode => {
      fixture.darkMode = darkMode;
      render(<ResourceManagement />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(status).toHaveAttribute('aria-atomic', 'true');
      clickPage(4);
      const navigation = screen.getByRole('navigation', { name: 'Resource pagination' });
      const current = within(navigation)
        .getAllByRole('button')
        .filter(button => button.getAttribute('aria-current') === 'page');
      expect(current).toHaveLength(1);
      expect(current[0]).toHaveAccessibleName('Go to page 4');
      expect(current[0]).toBeDisabled();
      const ellipses = within(navigation).getAllByText('...');
      expect(ellipses).toHaveLength(2);
      ellipses.forEach(ellipsis => {
        expect(ellipsis.tagName).toBe('SPAN');
        expect(ellipsis).toHaveAttribute('aria-hidden', 'true');
        expect(ellipsis).not.toHaveAttribute('tabindex');
      });
      expect(within(navigation).queryByRole('button', { name: '...' })).not.toBeInTheDocument();
      expect(screen.getByRole('status')).toBe(status);
    },
  );
});
