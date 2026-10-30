import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EventParticipation from '../EventParticipation';

const printing = vi.hoisted(() => ({ options: null, invoke: vi.fn() }));
vi.mock('react-to-print', () => ({
  useReactToPrint: options => {
    printing.options = options;
    return printing.invoke;
  },
}));
vi.mock('react-redux', () => ({
  useSelector: selector => selector({ theme: { darkMode: false } }),
}));
vi.mock('../EngagementSummaryCards', () => ({ default: () => null }));
vi.mock('../EventTypePieChart', () => ({ default: () => null }));
vi.mock('../EngagementBarChart', () => ({ default: () => null }));
vi.mock('../AnalyticsNavigation', () => ({ default: () => null }));
vi.mock('../DropOffTracking', () => ({ default: () => null }));
vi.mock('../NoShowInsights', () => ({ default: () => null }));
vi.mock('../CreateEventModal', () => ({ default: () => null }));
vi.mock('../mockData', () => ({
  default: Array.from({ length: 12 }, (_, index) => ({
    id: index,
    eventName: `Future event ${index + 1}`,
    eventDate: '2099-01-01',
    eventType: 'Yoga Class',
    eventTime: '10:00 AM',
    attendees: 10,
  })),
}));

beforeEach(() => {
  printing.invoke.mockReset();
});

describe('Participation PDF export', () => {
  it('renders all matching events before printing and restores collapsed state on close', async () => {
    render(<EventParticipation />);
    expect(screen.getAllByText(/Future event/)).toHaveLength(10);
    printing.invoke.mockImplementation(() => {
      expect(screen.getAllByText(/Future event/)).toHaveLength(12);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save as PDF' }));
    await waitFor(() => expect(printing.invoke).toHaveBeenCalledTimes(1));
    const preparing = screen.getByRole('button', { name: 'Preparing…' });
    expect(preparing).toBeDisabled();
    fireEvent.click(preparing);
    expect(printing.invoke).toHaveBeenCalledTimes(1);
    act(() => printing.options.onAfterPrint());
    expect(screen.getAllByText(/Future event/)).toHaveLength(10);
    expect(screen.getByRole('button', { name: 'Save as PDF' })).toBeEnabled();
  });

  it('preserves list view and expanded state after cancellation', () => {
    render(<EventParticipation />);
    fireEvent.click(screen.getByRole('button', { name: 'List' }));
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save as PDF' }));
    act(() => printing.options.onAfterPrint());
    expect(screen.getAllByRole('listitem')).toHaveLength(12);
    expect(screen.getByRole('button', { name: 'Show Less' })).toBeInTheDocument();
  });

  it('reports errors and allows retry', () => {
    render(<EventParticipation />);
    fireEvent.click(screen.getByRole('button', { name: 'Save as PDF' }));
    act(() => printing.options.onPrintError('print', new Error('Failed')));
    expect(screen.getByRole('alert')).toHaveTextContent('Please try again');
    fireEvent.click(screen.getByRole('button', { name: 'Save as PDF' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(printing.invoke).toHaveBeenCalledTimes(2);
  });

  it('restores the document title even when the browser print call fails', async () => {
    render(<EventParticipation />);
    const previousTitle = document.title;
    const iframe = {
      contentWindow: {
        document: {},
        focus: vi.fn(),
        print: vi.fn(() => {
          throw new Error('Failed');
        }),
      },
    };
    await expect(printing.options.print(iframe)).rejects.toThrow('Failed');
    expect(document.title).toBe(previousTitle);
  });
});
