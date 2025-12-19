import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ActivityFeedbackModal from './ActivityFeedbackForm';

const mockStore = configureStore([]);

vi.useFakeTimers();

describe('ActivityFeedbackModal', () => {
  const setup = () => {
    const store = mockStore({
      theme: { darkMode: false },
    });

    const onClose = vi.fn();

    render(
      <Provider store={store}>
        <ActivityFeedbackModal onClose={onClose} />
      </Provider>
    );

    return { onClose };
  };

  test('renders modal title', () => {
    setup();
    expect(screen.getByText('Activity Feedback')).toBeInTheDocument();
  });

  test('requires rating before submission', () => {
    setup();
    fireEvent.click(screen.getByText('Submit Feedback'));
    expect(screen.getByText('Please select a rating.')).toBeInTheDocument();
  });

  test('closes after successful submit', () => {
    const { onClose } = setup();

    fireEvent.click(screen.getByLabelText('Rate 5 stars'));
    fireEvent.click(screen.getByText('Submit Feedback'));

    vi.advanceTimersByTime(900);
    expect(screen.getByText('Feedback submitted!')).toBeInTheDocument();

    vi.advanceTimersByTime(1200);
    expect(onClose).toHaveBeenCalled();
  });
});
