import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PopularEvents from '../EventStats';

// Minimal mock reducer
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

describe('PopularEvents Component', () => {
  // ---------------------------
  // BASIC RENDER
  // ---------------------------
  test('renders header', () => {
    renderWithStore();
    expect(screen.getByRole('heading', { name: /Most Popular Event/i })).toBeInTheDocument();
  });

  test('renders exactly 7 event labels initially', () => {
    renderWithStore();
    const labels = screen.getAllByTestId('stat-label');
    expect(labels.length).toBe(7);
  });

  // ---------------------------
  // FILTERS
  // ---------------------------
  test('filters events by type (Offline)', () => {
    renderWithStore();
    const typeSelect = screen.getAllByRole('combobox')[1];

    fireEvent.change(typeSelect, { target: { value: 'Offline' } });

    const labels = screen.getAllByTestId('stat-label');
    expect(labels.length).toBe(4);
  });

  test('filters events by time (Morning)', () => {
    renderWithStore();
    const timeSelect = screen.getAllByRole('combobox')[0];

    fireEvent.change(timeSelect, { target: { value: 'Morning' } });

    const labels = screen.getAllByTestId('stat-label');
    expect(labels.length).toBe(3);
  });

  test('changing filters multiple times restores all 7 events', () => {
    renderWithStore();
    const select = screen.getAllByRole('combobox')[1];

    fireEvent.change(select, { target: { value: 'Offline' } });
    fireEvent.change(select, { target: { value: 'Online' } });
    fireEvent.change(select, { target: { value: 'All' } });

    const labels = screen.getAllByTestId('stat-label');
    expect(labels.length).toBe(7);
  });

  // ---------------------------
  // SUMMARY CARDS
  // ---------------------------
  test('summary shows correct values', () => {
    renderWithStore();

    expect(screen.getByText('Total Number of Events')).toBeInTheDocument();
    expect(screen.getByTestId('summary-total-events')).toHaveTextContent('7');

    expect(screen.getByTestId('summary-total-enrollments')).toHaveTextContent('145');

    expect(screen.getAllByText('Most Popular Event').length).toBe(2);
    expect(screen.getByTestId('summary-most')).toHaveTextContent('Type of Event 2');

    expect(screen.getAllByText('Least Popular Event').length).toBe(1);
    expect(screen.getByTestId('summary-least')).toHaveTextContent('Type of Event 7');
  });

  // ---------------------------
  // DARK MODE
  // ---------------------------
  test('dark mode applies proper class', () => {
    renderWithStore(true);

    const heading = screen.getByText('Most Popular Event');

    // text-light is applied when dark mode is true
    expect(heading.className.includes('text-light')).toBe(true);
  });

  // ---------------------------
  // EMPTY FILTER RESULTS
  // ---------------------------
  test('no summary cards when filteredData is empty', () => {
    renderWithStore();

    const timeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(timeSelect, { target: { value: 'NonExistent' } });

    // Header stays
    expect(screen.getByText('Most Popular Event')).toBeInTheDocument();

    // These MUST disappear because filteredData is empty
    expect(screen.queryByTestId('summary-most')).not.toBeInTheDocument();
    expect(screen.queryByTestId('summary-least')).not.toBeInTheDocument();
  });

  // ---------------------------
  // BAR WIDTH
  // ---------------------------
  test('bars have inline width style', () => {
    renderWithStore();

    const innerBars = screen.getAllByTestId('stat-bar-inner');

    innerBars.forEach(inner => {
      expect(inner.style.width).toMatch(/%/);
    });
  });
});
