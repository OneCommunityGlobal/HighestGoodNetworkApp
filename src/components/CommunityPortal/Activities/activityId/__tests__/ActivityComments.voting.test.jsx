import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import ThemeManager from '../../../../common/ThemeManager';
import ActivityComments from '../ActivityComments';
import styles from '../ActivityComments.module.css';

const mockStore = configureMockStore([]);

describe('ActivityComments voting controls', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.classList.remove('dark-mode', 'bm-dashboard-dark');
    document.documentElement.classList.remove('dark-mode');
  });

  afterEach(() => {
    document.body.classList.remove('dark-mode', 'bm-dashboard-dark');
    document.documentElement.classList.remove('dark-mode');
  });

  test('uses the semantic vote button classes and updates both counts', () => {
    render(<ActivityComments />);
    const upvoteButtons = screen.getAllByRole('button', { name: 'Upvote comment' });
    const downvoteButtons = screen.getAllByRole('button', { name: 'Downvote comment' });

    expect(upvoteButtons).toHaveLength(5);
    expect(downvoteButtons).toHaveLength(5);
    upvoteButtons.forEach(button => expect(button).toHaveClass(styles.upvoteBtn));
    downvoteButtons.forEach(button => expect(button).toHaveClass(styles.downvoteBtn));
    expect(upvoteButtons[0]).toHaveTextContent('5');
    expect(downvoteButtons[0]).toHaveTextContent('0');

    fireEvent.click(upvoteButtons[0]);
    fireEvent.click(downvoteButtons[0]);

    expect(upvoteButtons[0]).toHaveTextContent('6');
    expect(downvoteButtons[0]).toHaveTextContent('1');
  });

  test('keeps vote buttons under the global dark-mode selector chain', async () => {
    const store = mockStore({ theme: { darkMode: true } });
    render(
      <Provider store={store}>
        <ThemeManager />
        <ActivityComments />
      </Provider>,
    );

    await waitFor(() => {
      expect(document.body).toHaveClass('dark-mode', 'bm-dashboard-dark');
    });

    screen
      .getAllByRole('button', { name: 'Upvote comment' })
      .forEach(button => expect(button).toHaveClass(styles.upvoteBtn));
    screen
      .getAllByRole('button', { name: 'Downvote comment' })
      .forEach(button => expect(button).toHaveClass(styles.downvoteBtn));
  });
});
