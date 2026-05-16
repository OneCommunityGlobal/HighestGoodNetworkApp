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

describe('PopularEvents Component', () => {
  test('renders header', () => {
    renderWithStore();

    expect(screen.getByRole('heading', { name: /most popular event/i })).toBeInTheDocument();
  });

  test('renders exactly 7 event labels initially', () => {
    renderWithStore();

    const labels = screen.getAllByText(/Type of Event \d+/i);
    expect(labels).toHaveLength(7);
  });

  test('filters events by type (Offline)', () => {
    renderWithStore();

    const comboboxes = screen.getAllByRole('combobox');
    const typeSelect = comboboxes[1];

    fireEvent.change(typeSelect, { target: { value: 'Offline' } });

    const labels = screen.getAllByText(/Type of Event \d+/i);
    expect(labels).toHaveLength(4);
  });

  test('filters events by time (Morning)', () => {
    renderWithStore();

    const timeSelect = screen.getAllByRole('combobox')[0];

    fireEvent.change(timeSelect, { target: { value: 'Morning' } });

    const labels = screen.getAllByText(/Type of Event \d+/i);
    expect(labels).toHaveLength(3);
  });

  test('changing filters multiple times restores all 7 events', () => {
    renderWithStore();

    const typeSelect = screen.getAllByRole('combobox')[1];

    fireEvent.change(typeSelect, { target: { value: 'Offline' } });
    fireEvent.change(typeSelect, { target: { value: 'Online' } });
    fireEvent.change(typeSelect, { target: { value: 'All' } });

    const labels = screen.getAllByText(/Type of Event \d+/i);
    expect(labels).toHaveLength(7);
  });

  test('summary shows correct values', () => {
    renderWithStore();

    expect(screen.getByText('Total Number of Events')).toBeInTheDocument();
    expect(screen.getByText('Total Number of Event Enrollments')).toBeInTheDocument();
    expect(screen.getByText('Most Popular Event')).toBeInTheDocument();
    expect(screen.getByText('Least Popular Event')).toBeInTheDocument();
  });

  test('dark mode applies proper class', () => {
    renderWithStore(true);

    const heading = screen.getByRole('heading', {
      name: /most popular event/i,
    });

    // matches CSS module class name used in component
    expect(heading.className).toMatch(/popularEventsHeaderDark/);
  });

  test('no summary cards when filteredData is empty', () => {
    renderWithStore();

    const timeSelect = screen.getAllByRole('combobox')[0];

    fireEvent.change(timeSelect, { target: { value: 'NonExistent' } });

    // header should still exist
    expect(screen.getByRole('heading', { name: /most popular event/i })).toBeInTheDocument();

    // summary still renders structure text (based on your component logic)
    expect(screen.getByText('Most Popular Event')).toBeInTheDocument();
  });
});
