import { render, screen, fireEvent } from '@testing-library/react';
import * as reactRedux from 'react-redux';
import EventPage from '../EventPage';

vi.mock('react-calendar', () => ({
  default: () => <div data-testid="mock-calendar" />,
}));

vi.mock('react-datepicker', () => ({
  default: ({ onChange }) => (
    <input data-testid="mock-datepicker" onChange={e => onChange(new Date(e.target.value))} />
  ),
}));

const mockUseSelector = vi.spyOn(reactRedux, 'useSelector');

describe('EventPage', () => {
  beforeEach(() => {
    mockUseSelector.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<EventPage />);
    expect(screen.getByPlaceholderText(/Enter event description/i)).toBeInTheDocument();
  });

  it('renders event name input with default value', () => {
    render(<EventPage />);
    expect(screen.getByDisplayValue('Event Name')).toBeInTheDocument();
  });

  it('renders status dropdown with Active as default', () => {
    render(<EventPage />);
    const selects = screen.getAllByRole('combobox');
    const statusSelect = selects.find(s => s.value === 'Active');
    expect(statusSelect).toBeInTheDocument();
  });

  it('renders Post Description button', () => {
    render(<EventPage />);
    expect(screen.getByRole('button', { name: /Post Description/i })).toBeInTheDocument();
  });

  it('shows validation error when posting empty description', () => {
    render(<EventPage />);
    fireEvent.click(screen.getByRole('button', { name: /Post Description/i }));
    expect(screen.getByText(/Description cannot be empty/i)).toBeInTheDocument();
  });

  it('shows success message when posting non-empty description', () => {
    render(<EventPage />);
    fireEvent.change(screen.getByPlaceholderText(/Enter event description/i), {
      target: { value: 'A great event' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Post Description/i }));
    expect(screen.getByText(/Description posted successfully/i)).toBeInTheDocument();
  });
});
