import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ActivityList from '../ActivityList';

// Minimal mock reducer for theme
const mockThemeReducer = (state = { darkMode: false }) => state;

// Helper to render with Redux Provider
const renderWithRedux = (ui, { darkMode = false } = {}) => {
  const store = configureStore({
    reducer: {
      theme: () => ({ darkMode }),
    },
  });

  return render(<Provider store={store}>{ui}</Provider>);
};

describe('ActivityList', () => {
  test('renders Activity List heading', () => {
    renderWithRedux(<ActivityList />);
    expect(screen.getByText('Activity List')).toBeInTheDocument();
  });

  test('renders activities from mock data', () => {
    renderWithRedux(<ActivityList />);
    expect(screen.getByText('Yoga Class')).toBeInTheDocument();
    expect(screen.getByText('Book Club')).toBeInTheDocument();
  });

  test('filters activities by type', () => {
    renderWithRedux(<ActivityList />);

    fireEvent.change(screen.getByPlaceholderText('Enter type'), {
      target: { value: 'Fitness' },
    });

    expect(screen.getByText('Yoga Class')).toBeInTheDocument();
    expect(screen.queryByText('Book Club')).not.toBeInTheDocument();
  });

  test('filters activities by date', () => {
    renderWithRedux(<ActivityList />);

    fireEvent.change(screen.getByLabelText(/Date:/i), {
      target: { value: '2024-01-10' },
    });

    expect(screen.getByText('Yoga Class')).toBeInTheDocument();
    expect(screen.getByText('Dance Class')).toBeInTheDocument();
    expect(screen.queryByText('Book Club')).not.toBeInTheDocument();
  });

  test('sorts activities by date (latest to earliest)', () => {
    renderWithRedux(<ActivityList />);

    fireEvent.change(screen.getByLabelText(/Sort By:/i), {
      target: { value: 'latest' },
    });

    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Marathon Training');
  });

  test('renders correctly in dark mode', () => {
    renderWithRedux(<ActivityList />, { darkMode: true });
    expect(screen.getByText('Activity List')).toBeInTheDocument();
  });
});
