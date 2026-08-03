import { render, screen } from '@testing-library/react';
import * as reactRedux from 'react-redux';
import EventPage from '../EventPage';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ activityid: '1' }),
  useHistory: () => ({ push: vi.fn() }),
}));

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
});
