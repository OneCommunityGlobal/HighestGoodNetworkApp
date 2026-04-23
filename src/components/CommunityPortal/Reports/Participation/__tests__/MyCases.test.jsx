import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MyCases from '../MyCases';

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
  it('renders list view column headers for upcoming events', () => {
    renderWithStore(<MyCases />);

    fireEvent.click(screen.getByRole('button', { name: /list/i }));

    expect(screen.getByText(/event type/i)).toBeInTheDocument();
    expect(screen.getByText(/date & time/i)).toBeInTheDocument();
    expect(screen.getByText(/event name/i)).toBeInTheDocument();
    expect(screen.getByText(/attendees/i)).toBeInTheDocument();
  });
});
