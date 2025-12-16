import { render, screen, fireEvent } from '@testing-library/react';
import ActivityList from '../ActivityList';

describe('ActivityList', () => {
  test('renders Activity List heading', () => {
    render(<ActivityList />);
    expect(screen.getByText('Activity List')).toBeInTheDocument();
  });

  test('renders activities from mock data', () => {
    render(<ActivityList />);
    expect(screen.getByText('Yoga Class')).toBeInTheDocument();
    expect(screen.getByText('Book Club')).toBeInTheDocument();
  });

  test('filters activities by type', () => {
    render(<ActivityList />);

    fireEvent.change(screen.getByPlaceholderText('Enter type'), {
      target: { value: 'Fitness' },
    });

    expect(screen.getByText('Yoga Class')).toBeInTheDocument();
    expect(screen.queryByText('Book Club')).not.toBeInTheDocument();
  });

  test('filters activities by date', () => {
    render(<ActivityList />);

    fireEvent.change(screen.getByLabelText(/Date:/i), {
      target: { value: '2024-01-10' },
    });

    expect(screen.getByText('Yoga Class')).toBeInTheDocument();
    expect(screen.getByText('Dance Class')).toBeInTheDocument();
    expect(screen.queryByText('Book Club')).not.toBeInTheDocument();
  });

  test('sorts activities by date (latest to earliest)', () => {
    render(<ActivityList />);

    fireEvent.change(screen.getByLabelText(/Sort By:/i), {
      target: { value: 'latest' },
    });

    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Marathon Training');
  });
});
