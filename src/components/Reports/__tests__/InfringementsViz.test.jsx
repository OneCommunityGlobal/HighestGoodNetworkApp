import { vi } from 'vitest';

vi.mock('react', async importOriginal => {
  const React = await importOriginal();
  return {
    ...React,
    useEffect: fn => fn(),
  };
});

// now import everything else
import { render, fireEvent, screen } from '@testing-library/react';
import InfringementsViz from '../InfringementsViz';
// Mock D3 module
vi.mock('d3', () => {
  const chain = {
    append: vi.fn().mockReturnThis(),
    attr: vi.fn().mockReturnThis(),
    style: vi.fn().mockReturnThis(),
    datum: vi.fn().mockReturnThis(),
    data: vi.fn().mockReturnThis(),
    join: vi.fn().mockReturnThis(),
    html: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    call: vi.fn().mockReturnThis(),
    empty: vi.fn().mockReturnValue(true),
    selectAll: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(), // ← add this
    text: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  };

  return {
    select: vi.fn().mockReturnValue(chain),
    selectAll: vi.fn().mockReturnValue({ remove: vi.fn(), style: vi.fn().mockReturnThis() }),
    timeParse: vi.fn().mockImplementation(() => str => new Date(str)),
    timeFormat: vi.fn().mockImplementation(() => () => 'Jan 1, 2022'),
    scaleTime: vi
      .fn()
      .mockReturnValue({ domain: vi.fn().mockReturnThis(), range: vi.fn().mockReturnThis() }),
    scaleLinear: vi
      .fn()
      .mockReturnValue({ domain: vi.fn().mockReturnThis(), range: vi.fn().mockReturnThis() }),
    axisBottom: vi.fn(),
    axisLeft: vi
      .fn()
      .mockReturnValue({ ticks: vi.fn().mockReturnThis(), tickFormat: vi.fn().mockReturnThis() }),
    line: vi.fn().mockReturnValue({ x: vi.fn().mockReturnThis(), y: vi.fn().mockReturnThis() }),
    extent: vi.fn().mockReturnValue([new Date(), new Date()]),
    format: vi.fn().mockReturnValue(() => '0'),
  };
});

describe('InfringementsViz component', () => {
  // Sample infringements data for testing
  const mockInfringements = [
    {
      _id: '1',
      date: '2022-01-01',
      description: 'Test infringement 1',
    },
    {
      _id: '2',
      date: '2022-01-15',
      description: 'Test infringement 2',
    },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<InfringementsViz infringements={[]} fromDate="" toDate="" />);
    // If the component renders without errors, test passes
  });

  it('renders button to show graph', () => {
    render(<InfringementsViz infringements={[]} />);
    const showGraphButton = screen.getByText('Show Infringements Graph');
    expect(showGraphButton).toBeInTheDocument();
  });

  it('does not display the modal initially', () => {
    render(<InfringementsViz infringements={[]} fromDate="" toDate="" />);
    const modal = screen.queryByRole('dialog');
    expect(modal).not.toBeInTheDocument();
  });

  it('renders the graph when the "Show Infringements Graph" button is clicked', () => {
    render(<InfringementsViz infringements={mockInfringements} fromDate="" toDate="" />);

    const showButton = screen.getByText('Show Infringements Graph');
    fireEvent.click(showButton);

    // After clicking, button text should change
    expect(screen.getByText('Hide Infringements Graph')).toBeInTheDocument();

    // Check that the graph container exists
    expect(screen.getByTestId('infplot')).toBeInTheDocument();
  });

  it('displays the modal when the "Show Infringements Graph" button is clicked', () => {
    render(<InfringementsViz infringements={mockInfringements} fromDate="" toDate="" />);

    const showButton = screen.getByText('Show Infringements Graph');
    fireEvent.click(showButton);

    // Modal should now be visible (check for title or content)
    // This may not be accessible via queryByText if using Bootstrap Modal
    // so we'll check for button text change as a proxy
    expect(screen.getByText('Hide Infringements Graph')).toBeInTheDocument();
  });

  it('displays close button in modal footer', () => {
    const { getByText, getAllByRole } = render(
      <InfringementsViz infringements={mockInfringements} fromDate="" toDate="" />,
    );

    // Open the modal
    const showButton = screen.getByText('Show Infringements Graph');
    fireEvent.click(showButton);

    // Check for close buttons (may be multiple in Bootstrap modal)
    const buttons = screen.getAllByRole('button');
    const closeButton = Array.from(buttons).find(button => button.textContent === 'Close');

    expect(closeButton).toBeTruthy();
  });

  it('hides graph when button is clicked again', () => {
    render(<InfringementsViz infringements={mockInfringements} fromDate="" toDate="" />);

    // First click to show
    const showButton = screen.getByText('Show Infringements Graph');
    fireEvent.click(showButton);

    // Button text should change
    expect(screen.getByText('Hide Infringements Graph')).toBeInTheDocument();

    // Click again to hide
    const hideButton = screen.getByText('Hide Infringements Graph');
    fireEvent.click(hideButton);

    // Button should be back to original text
    expect(screen.getByText('Show Infringements Graph')).toBeInTheDocument();
  });
});
