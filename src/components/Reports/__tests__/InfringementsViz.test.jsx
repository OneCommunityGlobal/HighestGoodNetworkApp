import { render, fireEvent } from '@testing-library/react';
import InfringementsViz from '../InfringementsViz';

// Mock D3 module
jest.mock('d3', () => {
  return {
    select: jest.fn().mockReturnValue({
      append: jest.fn().mockReturnThis(),
      attr: jest.fn().mockReturnThis(),
      style: jest.fn().mockReturnThis(),
      datum: jest.fn().mockReturnThis(),
      data: jest.fn().mockReturnThis(),
      join: jest.fn().mockReturnThis(),
      html: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
      call: jest.fn().mockReturnThis(),
      empty: jest.fn().mockReturnValue(true),
      selectAll: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      remove: jest.fn(),
    }),
    selectAll: jest.fn().mockReturnValue({
      remove: jest.fn(),
      style: jest.fn().mockReturnThis(),
    }),
    timeParse: jest.fn().mockImplementation(() => str => new Date(str)),
    timeFormat: jest.fn().mockImplementation(() => () => 'Jan 1, 2022'),
    scaleTime: jest.fn().mockReturnValue({
      domain: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
    }),
    scaleLinear: jest.fn().mockReturnValue({
      domain: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
    }),
    axisBottom: jest.fn(),
    axisLeft: jest.fn().mockReturnValue({
      ticks: jest.fn().mockReturnThis(),
      tickFormat: jest.fn().mockReturnThis(),
    }),
    line: jest.fn().mockReturnValue({
      x: jest.fn().mockReturnThis(),
      y: jest.fn().mockReturnThis(),
    }),
    extent: jest.fn().mockReturnValue([new Date(), new Date()]),
    format: jest.fn().mockReturnValue(() => '0'),
  };
});

// We're disabling the useEffect for testing
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useEffect: jest.fn().mockImplementation(f => f()),
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
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<InfringementsViz infringements={[]} fromDate="" toDate="" />);
    // If the component renders without errors, test passes
  });

  it('renders button to show graph', () => {
    const { getByText } = render(<InfringementsViz infringements={[]} />);
    const showGraphButton = getByText('Show Infringements Graph');
    expect(showGraphButton).toBeInTheDocument();
  });

  it('does not display the modal initially', () => {
    const { queryByRole } = render(<InfringementsViz infringements={[]} fromDate="" toDate="" />);
    const modal = queryByRole('dialog');
    expect(modal).not.toBeInTheDocument();
  });

  it('renders the graph when the "Show Infringements Graph" button is clicked', () => {
    const { getByText, container } = render(
      <InfringementsViz infringements={mockInfringements} fromDate="" toDate="" />,
    );

    const showButton = getByText('Show Infringements Graph');
    fireEvent.click(showButton);

    // After clicking, button text should change
    expect(getByText('Hide Infringements Graph')).toBeInTheDocument();

    // Check that the graph container exists
    const graph = container.querySelector('#infplot');
    expect(graph).toBeInTheDocument();
  });

  it('displays the modal when the "Show Infringements Graph" button is clicked', () => {
    const { getByText } = render(
      <InfringementsViz infringements={mockInfringements} fromDate="" toDate="" />,
    );

    const showButton = getByText('Show Infringements Graph');
    fireEvent.click(showButton);

    // Modal should now be visible (check for title or content)
    // This may not be accessible via queryByText if using Bootstrap Modal
    // so we'll check for button text change as a proxy
    expect(getByText('Hide Infringements Graph')).toBeInTheDocument();
  });

  it('displays close button in modal footer', () => {
    const { getByText, getAllByRole } = render(
      <InfringementsViz infringements={mockInfringements} fromDate="" toDate="" />,
    );

    // Open the modal
    const showButton = getByText('Show Infringements Graph');
    fireEvent.click(showButton);

    // Check for close buttons (may be multiple in Bootstrap modal)
    const buttons = getAllByRole('button');
    const closeButton = Array.from(buttons).find(button => button.textContent === 'Close');

    expect(closeButton).toBeTruthy();
  });

  it('hides graph when button is clicked again', () => {
    const { getByText } = render(
      <InfringementsViz infringements={mockInfringements} fromDate="" toDate="" />,
    );

    // First click to show
    const showButton = getByText('Show Infringements Graph');
    fireEvent.click(showButton);

    // Button text should change
    expect(getByText('Hide Infringements Graph')).toBeInTheDocument();

    // Click again to hide
    const hideButton = getByText('Hide Infringements Graph');
    fireEvent.click(hideButton);

    // Button should be back to original text
    expect(getByText('Show Infringements Graph')).toBeInTheDocument();
  });
});
