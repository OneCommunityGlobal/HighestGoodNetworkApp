import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { describe, it, expect, vi } from 'vitest';
import ReviewButton from '../ReviewButton';

vi.mock('../../../services/httpService', () => ({
  default: { post: vi.fn(() => Promise.resolve({})) },
}));
vi.mock('~/utils/permissions', () => ({ default: () => () => false }));

const makeStore = () =>
  createStore(
    () => ({
      theme: { darkMode: false },
      auth: { user: { userid: 'u1', role: 'Volunteer' } },
    }),
    applyMiddleware(thunk),
  );

const unsubmittedTask = {
  _id: 't1',
  taskName: 'Task during vacation',
  resources: [{ userID: 'u1', reviewStatus: 'Unsubmitted' }],
  relatedWorkLinks: [],
};

const timeOffThisWeek = {
  requestFor: 'u1',
  startingDate: '2026-11-15T00:00:00.000Z',
  endingDate: '2026-11-22T00:00:00.000Z',
  reason: 'Vacation',
};

describe('ReviewButton during time off', () => {
  it('lets a user on time off this week submit their task for review', async () => {
    render(
      <Provider store={makeStore()}>
        <ReviewButton
          user={{ personId: 'u1', name: 'Ada Lovelace' }}
          task={unsubmittedTask}
          updateTask={vi.fn()}
          onTimeOff={timeOffThisWeek}
        />
      </Provider>,
    );

    const button = screen.getByRole('button', { name: 'Submit for Review' });
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute('title');

    await userEvent.click(button);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
