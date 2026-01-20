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
});
