import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DropOffTracking from '../DropOffTracking';
import { expect, vi, describe, it } from 'vitest';

// Mocking the mockData to provide a "Today" date so the filter doesn't hide rows
vi.mock('../mockData', () => ({
  default: [
    {
      id: 1,
      eventName: 'Yoga Class',
      eventType: 'Yoga Class',
      eventDate: new Date().toISOString(),
      eventTime: '10:00 AM',
      noShowRate: '5%',
      dropOffRate: '2%',
    },
  ],
}));

// Mock CSS Modules
vi.mock('../Participation.module.css', () => ({
  default: {
    trackingContainer: 'trackingContainer',
    trackingHeader: 'trackingHeader',
    trackingListContainer: 'trackingListContainer',
    trackingTable: 'trackingTable',
    getListBtn: 'getListBtn',
    modalOverlay: 'modalOverlay',
  },
}));

const renderWithStore = (ui, { darkMode = false } = {}) => {
  const store = configureStore({
    reducer: {
      theme: () => ({ darkMode }),
    },
  });
  return render(<Provider store={store}>{ui}</Provider>);
};

describe('DropOffTracking', () => {
  it('renders the section title', () => {
    renderWithStore(<DropOffTracking />);
    expect(screen.getByText(/Drop-off and no-show rate tracking/i)).toBeInTheDocument();
  });

  it('renders rows based on filtered mock data', () => {
    renderWithStore(<DropOffTracking />);

    // 1. Target the table cell specifically to avoid the dropdown option conflict
    const tableCell = screen.getByRole('cell', { name: /yoga class/i });
    expect(tableCell).toBeInTheDocument();

    // 2. Alternatively, if you want to check the specific text inside the table:
    // (Using selector to ensure we only look inside the table body)
    const yogaRow = screen.getByText('Yoga Class', { selector: 'td' });
    expect(yogaRow).toBeInTheDocument();

    const buttons = screen.getAllByRole('button', { name: /get no-show list/i });
    expect(buttons.length).toBe(1);
  });

  it('opens and closes the modal correctly', () => {
    renderWithStore(<DropOffTracking />);

    // Open Modal
    const button = screen.getByRole('button', { name: /get no-show list/i });
    fireEvent.click(button);
    expect(screen.getByText(/No-show list/i)).toBeInTheDocument();

    // Close Modal
    const closeBtn = screen.getByRole('button', { name: /✕/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/No-show list/i)).not.toBeInTheDocument();
  });

  it('updates selection when filtering by Event Type', () => {
    renderWithStore(<DropOffTracking />);

    // Target the specific dropdown by its visible text
    const eventSelect = screen.getByDisplayValue('All Events');

    // Change filter to something that doesn't exist in our mock
    fireEvent.change(eventSelect, { target: { value: 'Dance Class' } });

    // Check that the Yoga Class row is removed from the document
    expect(screen.queryByRole('cell', { name: /yoga class/i })).not.toBeInTheDocument();
  });
});
