import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ThemeManager from '../../../../common/ThemeManager';
import ActivityComments from '../ActivityComments';
import styles from '../ActivityComments.module.css';

const mockStore = configureMockStore([thunk]);

const createStore = (darkMode = false) =>
  mockStore({
    theme: { darkMode },
    membersList: { loading: false, members: [], error: null },
  });

const renderComments = (darkMode = false) =>
  render(
    <Provider store={createStore(darkMode)}>
      <ThemeManager />
      <ActivityComments />
    </Provider>,
  );

// Cards have no semantic role; scope queries through the uniquely identified comment text.
// eslint-disable-next-line testing-library/no-node-access
const getCard = text => screen.getByText(text).closest(`.${styles.commentItem}`);

const commentTexts = [
  /Great event! Really enjoyed the presentation/,
  /Thanks for organizing this! The networking session/,
  /Could we get the slides shared/,
  /Excellent speakers and well-organized agenda/,
  /This event exceeded my expectations/,
];

const expectCommentVotes = (text, upvotes, downvotes, vote = null) => {
  const card = within(getCard(text));
  expect(card.getByRole('button', { name: 'Upvote comment' })).toHaveAttribute(
    'aria-pressed',
    String(vote === 'up'),
  );
  expect(card.getByRole('button', { name: 'Downvote comment' })).toHaveAttribute(
    'aria-pressed',
    String(vote === 'down'),
  );
  expect(
    within(card.getByRole('button', { name: 'Upvote comment' })).getByText(String(upvotes)),
  ).toBeInTheDocument();
  expect(
    within(card.getByRole('button', { name: 'Downvote comment' })).getByText(String(downvotes)),
  ).toBeInTheDocument();
};

const getCommentOrder = () =>
  screen
    .getAllByText(/.+/, {
      selector: `.${styles.commentsList} > .${styles.commentItem} > .${styles.commentTopRow} > .${styles.commentName}`,
    })
    .map(name => name.textContent);

describe('ActivityComments interactions', () => {
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
    renderComments();
    const upvoteButtons = screen.getAllByRole('button', { name: 'Upvote comment' });
    const downvoteButtons = screen.getAllByRole('button', { name: 'Downvote comment' });

    expect(upvoteButtons).toHaveLength(5);
    expect(downvoteButtons).toHaveLength(5);
    upvoteButtons.forEach(button => expect(button).toHaveClass(styles.upvoteBtn));
    downvoteButtons.forEach(button => expect(button).toHaveClass(styles.downvoteBtn));
    expectCommentVotes(commentTexts[0], 5, 0);
    const card = within(getCard(commentTexts[0]));
    fireEvent.click(card.getByRole('button', { name: 'Upvote comment' }));
    fireEvent.click(card.getByRole('button', { name: 'Downvote comment' }));
    expectCommentVotes(commentTexts[0], 5, 1, 'down');
  });

  test.each([
    ['up', 'Upvote comment', 'Downvote comment', 6, 0, 5, 1, 'down'],
    ['down', 'Downvote comment', 'Upvote comment', 5, 1, 6, 0, 'up'],
  ])(
    'selects, undoes and switches a %s vote',
    (vote, name, opposite, up, down, switchedUp, switchedDown, switchedVote) => {
      renderComments();
      const card = within(getCard(commentTexts[0]));
      expectCommentVotes(commentTexts[0], 5, 0);
      fireEvent.click(card.getByRole('button', { name }));
      expectCommentVotes(commentTexts[0], up, down, vote);
      fireEvent.click(card.getByRole('button', { name }));
      expectCommentVotes(commentTexts[0], 5, 0);
      fireEvent.click(card.getByRole('button', { name }));
      expectCommentVotes(commentTexts[0], up, down, vote);
      fireEvent.click(card.getByRole('button', { name: opposite }));
      expectCommentVotes(commentTexts[0], switchedUp, switchedDown, switchedVote);
      fireEvent.click(card.getByRole('button', { name: opposite }));
      expectCommentVotes(commentTexts[0], 5, 0);
    },
  );

  test.each([
    ['Upvote comment', 1, 0, 'up'],
    ['Downvote comment', 0, 1, 'down'],
  ])('undoes %s on a newly posted comment back to zero', (name, up, down, vote) => {
    renderComments();
    const text = 'A new comment for voting';
    fireEvent.change(screen.getByRole('textbox'), { target: { value: text } });
    fireEvent.click(screen.getByRole('button', { name: 'Post', exact: true }));
    expectCommentVotes(text, 0, 0);
    const card = within(getCard(text));
    fireEvent.click(card.getByRole('button', { name }));
    expectCommentVotes(text, up, down, vote);
    fireEvent.click(card.getByRole('button', { name }));
    expectCommentVotes(text, 0, 0);
  });

  test('keeps votes across tabs but resets them on remount', () => {
    const { unmount } = renderComments();
    fireEvent.click(
      within(getCard(commentTexts[0])).getByRole('button', { name: 'Upvote comment' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Feedback', exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Comment', exact: true }));
    expectCommentVotes(commentTexts[0], 6, 0, 'up');
    unmount();
    renderComments();
    expectCommentVotes(commentTexts[0], 5, 0);
  });

  test('toggles top-level comments between newest and oldest order', () => {
    renderComments();
    const newest = ['Sarah Wilson', 'Alex Rodriguez', 'Emma Thompson', 'David Kim', 'Lisa Chen'];
    expect(getCommentOrder()).toEqual(newest);

    fireEvent.click(screen.getByRole('button', { name: /Newest/ }));
    expect(getCommentOrder()).toEqual([
      'Lisa Chen',
      'David Kim',
      'Emma Thompson',
      'Alex Rodriguez',
      'Sarah Wilson',
    ]);

    fireEvent.click(screen.getByRole('button', { name: /Oldest/ }));
    expect(screen.getByRole('button', { name: /Newest/ })).toBeInTheDocument();
    expect(getCommentOrder()).toEqual(newest);
  });

  test.each([false, true])(
    'toggles Helpful without changing other reviews (darkMode=%s)',
    darkMode => {
      renderComments(darkMode);
      fireEvent.click(screen.getByRole('button', { name: 'Feedback', exact: true }));
      const helpfulButton = text => within(getCard(text)).getByRole('button', { name: 'Helpful' });
      const sarah = /This was an absolutely fantastic event!/;
      const expectHelpfulCounts = (count, pressed) => {
        expect(helpfulButton(sarah)).toHaveAttribute('aria-pressed', String(pressed));
        expect(helpfulButton(/Really enjoyed the event overall/)).toHaveAttribute(
          'aria-pressed',
          'false',
        );
        expect(helpfulButton(/The event was okay/)).toHaveAttribute('aria-pressed', 'false');
        expect(within(helpfulButton(sarah)).getByText(String(count))).toBeInTheDocument();
        expect(
          within(helpfulButton(/Really enjoyed the event overall/)).getByText('8'),
        ).toBeInTheDocument();
        expect(within(helpfulButton(/The event was okay/)).getByText('3')).toBeInTheDocument();
      };

      expectHelpfulCounts(12, false);
      fireEvent.click(helpfulButton(sarah));
      expectHelpfulCounts(13, true);
      fireEvent.click(helpfulButton(sarah));
      expectHelpfulCounts(12, false);
    },
  );

  test('restores Helpful selection and count after remounting', () => {
    const { unmount } = renderComments();
    const openFeedback = () =>
      fireEvent.click(screen.getByRole('button', { name: 'Feedback', exact: true }));
    const helpfulButton = () =>
      within(getCard(/This was an absolutely fantastic event!/)).getByRole('button', {
        name: 'Helpful',
      });

    openFeedback();
    fireEvent.click(helpfulButton());
    expect(helpfulButton()).toHaveAttribute('aria-pressed', 'true');
    expect(within(helpfulButton()).getByText('13')).toBeInTheDocument();
    unmount();

    renderComments();
    openFeedback();
    expect(helpfulButton()).toHaveAttribute('aria-pressed', 'true');
    expect(within(helpfulButton()).getByText('13')).toBeInTheDocument();
    fireEvent.click(helpfulButton());
    expect(helpfulButton()).toHaveAttribute('aria-pressed', 'false');
    expect(within(helpfulButton()).getByText('12')).toBeInTheDocument();
  });

  test.each([
    ['Upvote comment', 6, 0],
    ['Downvote comment', 5, 1],
  ])('%s changes only the selected comment and survives reordering', (buttonName, up, down) => {
    renderComments();
    fireEvent.click(screen.getByRole('button', { name: /Newest/ }));
    const expectCounts = () => {
      expectCommentVotes(
        commentTexts[0],
        up,
        down,
        buttonName === 'Upvote comment' ? 'up' : 'down',
      );
      expectCommentVotes(commentTexts[1], 3, 0);
      expectCommentVotes(commentTexts[2], 8, 1);
      expectCommentVotes(commentTexts[3], 2, 0);
      expectCommentVotes(commentTexts[4], 12, 0);
    };

    fireEvent.click(within(getCard(commentTexts[0])).getByRole('button', { name: buttonName }));
    expectCounts();
    fireEvent.click(screen.getByRole('button', { name: /Oldest/ }));
    expectCounts();
  });

  test('keeps vote buttons under the global dark-mode selector chain', async () => {
    renderComments(true);

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
