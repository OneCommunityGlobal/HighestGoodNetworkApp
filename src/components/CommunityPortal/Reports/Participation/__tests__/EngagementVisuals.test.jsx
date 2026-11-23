import { render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EngagementVisuals from '../EngagementVisuals';
import { getEngagementMetrics, getFormatComparison } from '~/actions/eventActions';

vi.mock('~/actions/eventActions', () => ({
  getEngagementMetrics: vi.fn(),
  getFormatComparison: vi.fn(),
}));

const events = [
  {
    eventId: 'one-attendee',
    title: 'AI Product Launch',
    type: 'Social Gathering',
    averageSessionDuration: 120,
    attendees: 1,
    interactionRate: 2,
    location: 'In person',
  },
  {
    eventId: 'virtual-event',
    title: 'UI/UX Design Fundamentals',
    type: 'Workshop',
    averageSessionDuration: 180,
    attendees: 7,
    interactionRate: 17.5,
    location: 'Virtual',
  },
  {
    eventId: 'missing-location',
    title: 'Spring Networking Mixer',
    type: 'Social Gathering',
    averageSessionDuration: 180,
    attendees: 0,
    interactionRate: 5.3,
    location: '',
  },
];

const engagement = {
  averageSessionDuration: 160,
  totalAttendees: 8,
  averageInteractionRate: 8.3,
  totalEvents: events.length,
  events,
};

const comparison = {
  virtual: { totalEvents: 1, totalAttendees: 7, averageAttendeesPerEvent: 7 },
  inPerson: { totalEvents: 2, totalAttendees: 1, averageAttendeesPerEvent: 0.5 },
};

function renderWithStore({ darkMode = false } = {}) {
  const store = configureStore({
    reducer: {
      theme: () => ({ darkMode }),
    },
  });

  return render(
    <Provider store={store}>
      <EngagementVisuals />
    </Provider>,
  );
}

describe('EngagementVisuals event cards', () => {
  beforeEach(() => {
    getEngagementMetrics.mockResolvedValue({ data: { engagement } });
    getFormatComparison.mockResolvedValue({ data: { comparison } });
  });

  it('uses singular and plural attendee labels correctly', async () => {
    renderWithStore();

    expect(await screen.findByText('1 attendee')).toBeInTheDocument();
    expect(screen.getByText('7 attendees')).toBeInTheDocument();
    expect(screen.getByText('0 attendees')).toBeInTheDocument();
    expect(screen.queryByText('1 attendees')).not.toBeInTheDocument();
  });

  it('normalizes event format labels and supplies the missing in-person label', async () => {
    renderWithStore({ darkMode: true });

    const virtualCard = await screen.findByLabelText(
      'Event engagement details for UI/UX Design Fundamentals',
    );
    const inPersonCard = screen.getByLabelText('Event engagement details for AI Product Launch');
    const missingLocationCard = screen.getByLabelText(
      'Event engagement details for Spring Networking Mixer',
    );

    expect(within(virtualCard).getByText('Virtual')).toBeInTheDocument();
    expect(within(inPersonCard).getByText('In-Person')).toBeInTheDocument();
    expect(within(missingLocationCard).getByText('In-Person')).toBeInTheDocument();
    expect(screen.queryByText('In person')).not.toBeInTheDocument();
  });
});
