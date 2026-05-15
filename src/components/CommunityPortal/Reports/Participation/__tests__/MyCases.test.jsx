import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import MyCases from '../MyCases';

vi.mock('axios');

vi.mock('../MyCases.module.css', () => ({
  default: new Proxy(
    {},
    {
      get: (_target, prop) => String(prop),
    },
  ),
}));

vi.mock('../CreateEventModal', () => ({
  default: function CreateEventModal() {
    return null;
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

describe('MyCases', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        events: [
          {
            _id: 'event-1',
            title: 'Upcoming Planning Session',
            type: 'Meeting',
            date: '2099-01-15T00:00:00.000Z',
            startTime: '17:00',
            currentAttendees: 12,
            location: 'Virtual',
          },
        ],
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders list view column headers for upcoming events', async () => {
    renderWithStore(<MyCases />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    fireEvent.click(await screen.findByRole('button', { name: /list/i }));

    expect(screen.getByText(/event type/i)).toBeInTheDocument();
    expect(screen.getByText(/date & time/i)).toBeInTheDocument();
    expect(screen.getByText(/event name/i)).toBeInTheDocument();
    expect(screen.getByText(/attendees/i)).toBeInTheDocument();
  });
});
