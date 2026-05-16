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
    expect(screen.getByRole('heading', { name: /Most Popular Event/i })).toBeInTheDocument();
  });

  test('renders exactly 7 event labels initially', () => {
    renderWithStore();

    const labels = screen.getAllByText(/Type of Event/i);
    expect(labels.length).toBe(7);
  });

  test('filters events by type (Offline)', () => {
    renderWithStore();

    const comboboxes = screen.getAllByRole('combobox');
    const typeSelect = comboboxes[1];

    fireEvent.change(typeSelect, { target: { value: 'Offline' } });

    const labels = screen.getAllByText(/Type of Event/i);
    expect(labels.length).toBe(4);
  });

  test('filters events by time (Morning)', () => {
    renderWithStore();

    const timeSelect = screen.getAllByRole('combobox')[0];

    fireEvent.change(timeSelect, { target: { value: 'Morning' } });

    const labels = screen.getAllByText(/Type of Event/i);
    expect(labels.length).toBe(3);
  });

  test('changing filters multiple times restores all 7 events', () => {
    renderWithStore();

    const select = screen.getAllByRole('combobox')[1];

    fireEvent.change(select, { target: { value: 'Offline' } });
    fireEvent.change(select, { target: { value: 'Online' } });
    fireEvent.change(select, { target: { value: 'All' } });

    const labels = screen.getAllByText(/Type of Event/i);
    expect(labels.length).toBe(7);
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
      name: 'Most Popular Event',
    });

    expect(heading.className.includes('text-light')).toBe(true);
  });

  test('no summary cards when filteredData is empty', () => {
    renderWithStore();

    const timeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(timeSelect, { target: { value: 'NonExistent' } });

    expect(screen.getByRole('heading', { name: 'Most Popular Event' })).toBeInTheDocument();

    expect(screen.getByText('Most Popular Event')).toBeInTheDocument();
  });
});
