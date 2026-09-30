import { render, screen, fireEvent } from '@testing-library/react';
import ResourceUsage from '../ResourceUsage';
import * as reactRedux from 'react-redux';

// Mock useSelector for dark mode
const mockUseSelector = vi.spyOn(reactRedux, 'useSelector');

describe('ResourceUsage Component', () => {
  beforeEach(() => {
    mockUseSelector.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------
  // Renders main title
  // -----------------------------
  it('renders the title', () => {
    render(<ResourceUsage />);
    expect(screen.getByText(/Resources usage/i)).toBeInTheDocument();
  });

  // -----------------------------
  // Dropdown interaction test
  // -----------------------------
  it('changes resource type when dropdown is clicked', () => {
    render(<ResourceUsage />);

    // Get the FIRST dropdown toggle for Resource Type
    const [resourceTypeToggle] = screen.getAllByRole('button', {
      name: /Material|Venue|Equipment/i,
    });

    // open dropdown
    fireEvent.click(resourceTypeToggle);

    // Find ALL "Venue" buttons
    const venueButtons = screen.getAllByRole('button', { name: 'Venue' });

    // The LAST one is the dropdown menu option
    const menuOption = venueButtons[venueButtons.length - 1];

    fireEvent.click(menuOption);

    // Assert the toggle text updated
    expect(resourceTypeToggle).toHaveTextContent('Venue');
  });

  // -----------------------------
  // Insights section renders
  // -----------------------------
  it('renders insights section', () => {
    render(<ResourceUsage />);
    expect(screen.getByText(/Insights/i)).toBeInTheDocument();
  });

  // -----------------------------
  // Dark mode classes applied
  // -----------------------------
  it('applies dark mode classes when darkMode = true', () => {
    // mock dark mode state
    mockUseSelector.mockReturnValue(true);

    render(<ResourceUsage />);

    const container = screen.getByTestId('resource-usage-container');

    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('dark-mode');
  });

  // -----------------------------
  // Filter icons
  // -----------------------------
  // The icons are decorative and aria-hidden, so they carry a test id rather
  // than an accessible name. lucide-react tags each one with a `lucide-*` class.
  const lucideNameOf = icon => [...icon.classList].find(name => name.startsWith('lucide-'));

  const optionIconNames = () => screen.getAllByTestId('filter-option-icon').map(lucideNameOf);

  it('shows an icon on every filter toggle', () => {
    render(<ResourceUsage />);

    expect(screen.getAllByTestId('filter-icon')).toHaveLength(3);
  });

  it('swaps the resource type icon when the selection changes', () => {
    render(<ResourceUsage />);

    expect(lucideNameOf(screen.getAllByTestId('filter-icon')[0])).toBe('lucide-package');

    // The toggle and its menu row share a label, so the menu row is the later match.
    fireEvent.click(screen.getAllByRole('button', { name: /^Material$/ }).at(-1));
    fireEvent.click(screen.getAllByRole('button', { name: 'Equipment' }).at(-1));

    expect(lucideNameOf(screen.getAllByTestId('filter-icon')[0])).toBe('lucide-wrench');
  });

  // A menu only renders its rows while open, so each test opens the one it
  // asserts on. While every menu is closed a toggle's label is unique, which
  // makes it a safe handle.
  it('gives each resource type option its own icon', () => {
    render(<ResourceUsage />);

    const [resourceToggle] = screen.getAllByRole('button', { name: /Material|Venue|Equipment/i });
    fireEvent.click(resourceToggle);

    expect(optionIconNames()).toEqual(['lucide-package', 'lucide-wrench', 'lucide-building2']);
  });

  it('marks the current time period with a check', () => {
    render(<ResourceUsage />);

    // "This Week" is the chart filter's default, so the toggle is the only
    // button carrying that name until the menu opens.
    fireEvent.click(screen.getByRole('button', { name: 'This Week' }));

    expect(optionIconNames()).toEqual(['lucide-check']);
  });

  it('moves the check when a different time period is chosen', () => {
    render(<ResourceUsage />);

    fireEvent.click(screen.getByRole('button', { name: 'This Week' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'This Month' }).at(-1));

    // The rows stay mounted once the menu has been opened, so the check should
    // have moved to the new selection rather than duplicated.
    expect(optionIconNames()).toEqual(['lucide-check']);
  });
});
