import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DropOffTracking from '../DropOffTracking';

vi.mock('../Participation.module.css', () => ({
  default: {
    trackingContainer: 'trackingContainer',
    trackingContainerDark: 'trackingContainerDark',
    trackingHeader: 'trackingHeader',
    trackingHeaderDark: 'trackingHeaderDark',
    trackingListContainer: 'trackingListContainer',
    trackingListContainerDark: 'trackingListContainerDark',
    trackingTable: 'trackingTable',
    trackingTableDark: 'trackingTableDark',
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
  it('renders the Drop-off and no-show rate tracking section', () => {
    renderWithStore(<DropOffTracking />);

    expect(screen.getByText(/Drop-off and no-show rate tracking/i)).toBeInTheDocument();
  });

  it('renders table headers correctly', () => {
    renderWithStore(<DropOffTracking />);

    expect(screen.getByText(/Event name/i)).toBeInTheDocument();
    expect(screen.getAllByText(/No-show rate/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Drop-off rate/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Get list/i)).toBeInTheDocument();
  });

  it('renders Get List buttons for each row', () => {
    renderWithStore(<DropOffTracking />);

    const buttons = screen.getAllByLabelText(/get no-show list/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles clicking Get List button without crashing', () => {
    renderWithStore(<DropOffTracking />);

    const button = screen.getAllByLabelText(/get no-show list/i)[0];
    fireEvent.click(button);

    expect(button).toBeInTheDocument();
  });
});
