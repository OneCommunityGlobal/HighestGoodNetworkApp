import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { expect, vi, describe, it } from 'vitest';
import NoShowInsights from '../NoShowInsights';

// Three "mine" (even id) events today; the last one has no no-show rate
vi.mock('../mockData', () => ({
  default: [
    {
      id: 2,
      eventType: 'Yoga Class',
      eventDate: new Date().toISOString(),
      eventTime: '10:00 AM',
      location: 'Austin',
      noShowRate: '20%',
      ageGroup: '18-25',
      gender: 'Female',
    },
    {
      id: 4,
      eventType: 'Dance Class',
      eventDate: new Date().toISOString(),
      eventTime: '2:00 PM',
      location: 'Chicago',
      noShowRate: '60%',
      ageGroup: '50+',
      gender: 'Female',
    },
    {
      id: 6,
      eventType: 'Art Class',
      eventDate: new Date().toISOString(),
      eventTime: '4:00 PM',
      location: 'Denver',
      ageGroup: '50+',
      gender: 'Female',
    },
  ],
}));

const renderWithStore = () => {
  const store = configureStore({ reducer: { theme: () => ({ darkMode: false }) } });
  return render(
    <Provider store={store}>
      <NoShowInsights />
    </Provider>,
  );
};

const TAB_NAMES = ['Demographics', 'Event type', 'Time', 'Location'];

describe('NoShowInsights', () => {
  it('lists Demographics first of the four tabs', () => {
    renderWithStore();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map(tab => tab.textContent.trim())).toEqual(TAB_NAMES);
  });

  it('opens on Event type, not Demographics', () => {
    renderWithStore();
    expect(screen.getByRole('tab', { name: 'Event type' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Demographics' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.queryByLabelText('Demographic breakdown')).not.toBeInTheDocument();
    expect(screen.getByText('Yoga Class')).toBeInTheDocument();
  });

  it('groups no-show rates by the chosen demographic', () => {
    renderWithStore();
    fireEvent.click(screen.getByRole('tab', { name: 'Demographics' }));
    expect(screen.getByText('18-25')).toBeInTheDocument();
    expect(screen.getByText('50+')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Demographic breakdown'), {
      target: { value: 'Gender' },
    });
    expect(screen.getByText('Female')).toBeInTheDocument();
    // The event without a rate is left out of the average
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('never shows NaN% for an event without a no-show rate', () => {
    renderWithStore();
    fireEvent.click(screen.getByRole('tab', { name: 'Location' }));
    expect(screen.getByText('Austin')).toBeInTheDocument();
    expect(screen.queryByText('Denver')).not.toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it('hides the demographic selector on other tabs', () => {
    renderWithStore();
    fireEvent.click(screen.getByRole('tab', { name: 'Demographics' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Location' }));
    expect(screen.queryByLabelText('Demographic breakdown')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Location' })).toHaveAttribute('aria-selected', 'true');
  });
});
