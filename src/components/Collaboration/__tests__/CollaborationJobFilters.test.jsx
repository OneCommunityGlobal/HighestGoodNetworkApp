import { render, screen, fireEvent } from '@testing-library/react';
import CollaborationJobFilters from '../CollaborationJobFilters';
import styles from '../Collaboration.module.css';

describe('CollaborationJobFilters Component', () => {
  const baseProps = {
    query: '',
    handleSearch: vi.fn(),
    handleSubmit: vi.fn(e => e.preventDefault()),
    canReorderJobs: false,
    toggleReorderModal: vi.fn(),
    showTooltip: false,
    tooltipPosition: null,
    dismissSearchTooltip: vi.fn(),
    dismissCategoryTooltip: vi.fn(),
    dropdownRef: { current: null },
    isDropdownOpen: false,
    setIsDropdownOpen: vi.fn(),
    categories: ['Engineering', 'Design'],
    selectedCategories: [],
    toggleCategory: vi.fn(),
  };

  test('renders search input and Go button', () => {
    render(<CollaborationJobFilters {...baseProps} />);

    expect(screen.getByPlaceholderText('Search by title...')).toBeInTheDocument();
    expect(screen.getByText('Go')).toBeInTheDocument();
  });

  test('calls handleSearch when typing', () => {
    render(<CollaborationJobFilters {...baseProps} />);

    fireEvent.change(screen.getByPlaceholderText('Search by title...'), {
      target: { value: 'test' },
    });

    expect(baseProps.handleSearch).toHaveBeenCalled();
  });

  test('shows reorder button when canReorderJobs = true', () => {
    render(<CollaborationJobFilters {...baseProps} canReorderJobs={true} />);

    expect(screen.getByText('Edit to Reorder')).toBeInTheDocument();
  });

  test('toggles dropdown open state when clicking category button', () => {
    render(<CollaborationJobFilters {...baseProps} />);

    fireEvent.click(screen.getByText('Select Categories ▼'));

    expect(baseProps.setIsDropdownOpen).toHaveBeenCalled();
  });

  test('renders dropdown when open', () => {
    render(<CollaborationJobFilters {...baseProps} isDropdownOpen={true} />);

    expect(screen.getByLabelText('Engineering')).toBeInTheDocument();
    expect(screen.getByLabelText('Design')).toBeInTheDocument();
  });

  test('calls toggleCategory when clicking checkbox', () => {
    render(<CollaborationJobFilters {...baseProps} isDropdownOpen={true} />);

    fireEvent.click(screen.getByLabelText('Engineering'));
    expect(baseProps.toggleCategory).toHaveBeenCalledWith('Engineering');
  });

  test('shows search tooltip when applicable', () => {
    render(<CollaborationJobFilters {...baseProps} showTooltip={true} tooltipPosition="search" />);

    expect(screen.getByText(/Use the search bar/i)).toBeInTheDocument();
  });

  test('shows category tooltip when applicable', () => {
    render(
      <CollaborationJobFilters {...baseProps} showTooltip={true} tooltipPosition="category" />,
    );

    expect(screen.getByText(/Use the categories/i)).toBeInTheDocument();
  });
});
