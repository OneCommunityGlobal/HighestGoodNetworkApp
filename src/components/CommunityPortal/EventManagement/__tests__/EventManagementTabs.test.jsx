import { render, screen, fireEvent } from '@testing-library/react';
import EventManagementTabs from '../EventManagementTabs';

describe('EventManagementTabs', () => {
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
    const analysisBtn = screen.getByRole('button', { name: /Analysis/i });
    expect(analysisBtn.className).toMatch(/active/i);
  });

  it('shows engagement sub-sections when Engagement tab clicked', () => {
    render(<EventManagementTabs />);
    fireEvent.click(screen.getByRole('button', { name: /Engagement/i }));
    expect(screen.getByRole('button', { name: /COMMENTS/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /FEEDBACK/i })).toBeInTheDocument();
  });
});
