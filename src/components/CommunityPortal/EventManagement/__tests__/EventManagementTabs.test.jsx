import { render, screen, fireEvent } from '@testing-library/react';
import EventManagementTabs from '../EventManagementTabs';

const mockPush = vi.fn();

vi.mock('react-router-dom', () => ({
  useParams: () => ({ activityid: '1', tab: undefined, section: undefined }),
  useHistory: () => ({ push: mockPush }),
}));

describe('EventManagementTabs', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all four tabs', () => {
    render(<EventManagementTabs />);
    expect(screen.getByRole('button', { name: /Description/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analysis/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Resources/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Engagement/i })).toBeInTheDocument();
  });

  it('defaults to description tab active state', () => {
    render(<EventManagementTabs />);
    const descBtn = screen.getByRole('button', { name: /Description/i });
    expect(descBtn.className).toMatch(/active/i);
  });

  it('switches to Analysis tab on click', () => {
    render(<EventManagementTabs />);
    fireEvent.click(screen.getByRole('button', { name: /Analysis/i }));
    expect(mockPush).toHaveBeenCalled();
  });

  it('shows engagement sub-sections when Engagement tab clicked', () => {
    render(<EventManagementTabs />);
    fireEvent.click(screen.getByRole('button', { name: /Engagement/i }));
    expect(screen.getByRole('button', { name: /COMMENTS/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /FEEDBACK/i })).toBeInTheDocument();
  });
});
