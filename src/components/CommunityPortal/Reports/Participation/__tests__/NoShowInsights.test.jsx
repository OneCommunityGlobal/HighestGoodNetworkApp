import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { expect, vi, describe, it } from 'vitest';
import NoShowInsights from '../NoShowInsights';

// Two "mine" (even id) events today with different demographics
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

describe('NoShowInsights', () => {
  it('shows Demographics as the first of the four tabs', () => {
    renderWithStore();
    const tabs = ['Demographics', 'Event type', 'Time', 'Location'].map(name =>
      screen.getByRole('button', { name }),
    );
    // Each tab follows the previous one in the document
    tabs.slice(1).forEach((tab, i) => {
      expect(tabs[i].compareDocumentPosition(tab) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
  });

  it('groups no-show rates by the chosen demographic', () => {
    renderWithStore();
    expect(screen.getByText('18-25')).toBeInTheDocument();
    expect(screen.getByText('50+')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Demographic breakdown'), {
      target: { value: 'Gender' },
    });
    expect(screen.getByText('Female')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('hides the demographic selector on other tabs', () => {
    renderWithStore();
    fireEvent.click(screen.getByRole('button', { name: 'Location' }));
    expect(screen.queryByLabelText('Demographic breakdown')).not.toBeInTheDocument();
    expect(screen.getByText('Austin')).toBeInTheDocument();
  });
});
