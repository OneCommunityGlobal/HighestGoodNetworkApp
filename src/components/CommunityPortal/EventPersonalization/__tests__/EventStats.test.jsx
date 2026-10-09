import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PopularEvents from '../EventStats';

const mockThemeReducer = (darkMode = false) => () => ({ darkMode });

const renderWithStore = (darkMode = false) => {
  const store = configureStore({
    reducer: {
      theme: mockThemeReducer(darkMode),
    },
  });

  return render(
    <Provider store={store}>
      <PopularEvents />
    </Provider>,
  );
};

const getEventBars = () =>
  screen.getAllByText((_, node) => {
    return Boolean(node?.textContent?.match(/^\d{1,3}% \(\d{1,3}\/\d{1,3}\)$/));
  }); // unique per event row

describe('PopularEvents Component', () => {
  test('renders header', () => {
    renderWithStore();

    expect(screen.getByRole('heading', { name: /most popular event/i })).toBeInTheDocument();
  });

  test('renders exactly 7 event items initially', () => {
    renderWithStore();

    expect(getEventBars()).toHaveLength(7);
  });

  test('filters events by type (Offline)', () => {
    renderWithStore();

    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: 'Offline' },
    });

    expect(getEventBars()).toHaveLength(4);
  });

  test('filters events by time (Morning)', () => {
    renderWithStore();

    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'Morning' },
    });

    expect(getEventBars()).toHaveLength(3);
  });

  test('changing filters restores all events', () => {
    renderWithStore();

    const typeSelect = screen.getAllByRole('combobox')[1];

    fireEvent.change(typeSelect, { target: { value: 'Offline' } });
    fireEvent.change(typeSelect, { target: { value: 'Online' } });
    fireEvent.change(typeSelect, { target: { value: 'All' } });

    expect(getEventBars()).toHaveLength(7);
  });

  test('dark mode applies proper class', () => {
    renderWithStore(true);

    const heading = screen.getByRole('heading', {
      name: /most popular event/i,
    });

    expect(heading.className).toMatch(/popularEventsHeaderDark/);
  });

  test('empty filter still renders structure', () => {
    renderWithStore();

    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'NonExistent' },
    });

    expect(screen.getByRole('heading', { name: /most popular event/i })).toBeInTheDocument();
  });
});
