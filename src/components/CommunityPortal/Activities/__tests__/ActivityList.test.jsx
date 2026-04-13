import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import ActivityList from '../ActivityList';

const mockStore = configureMockStore([]);

const renderActivityList = (initialState = { theme: { darkMode: false } }) => {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
      <ActivityList />
    </Provider>,
  );
};

describe('ActivityList', () => {
  test('renders Activity List heading', () => {
    renderActivityList();
    expect(screen.getByText('Activity List')).toBeInTheDocument();
  });

  test('renders activities from mock data', () => {
    renderActivityList();
    fireEvent.click(screen.getByLabelText(/Show Past Events:/i));
    expect(screen.getByText('Yoga Class')).toBeInTheDocument();
    expect(screen.getByText('Book Club')).toBeInTheDocument();
  });

  test('filters activities by type', () => {
    renderActivityList();
    fireEvent.click(screen.getByLabelText(/Show Past Events:/i));

    fireEvent.change(screen.getByLabelText(/Type:/i), {
      target: { value: 'Fitness' },
    });

    expect(screen.getByText('Yoga Class')).toBeInTheDocument();
    expect(screen.queryByText('Book Club')).not.toBeInTheDocument();
  });

  test('filters activities by date', () => {
    renderActivityList();
    fireEvent.click(screen.getByLabelText(/Show Past Events:/i));

    fireEvent.change(screen.getByLabelText(/Date:/i), {
      target: { value: '2024-01-10' },
    });

    expect(screen.getByText('Yoga Class')).toBeInTheDocument();
    expect(screen.getByText('Dance Class')).toBeInTheDocument();
    expect(screen.queryByText('Book Club')).not.toBeInTheDocument();
  });

  test('sorts activities by date (latest to earliest)', () => {
    renderActivityList();

    fireEvent.change(screen.getByLabelText(/Sort By:/i), {
      target: { value: 'latest' },
    });

    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Marathon Training');
  });
});
