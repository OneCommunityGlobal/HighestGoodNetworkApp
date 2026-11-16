import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReviewButton from '../ReviewButton';
import httpService from '../../../services/httpService';

vi.mock('../../../services/httpService', () => ({
  default: { post: vi.fn(() => Promise.resolve({})) },
}));
vi.mock('~/utils/permissions', () => ({ default: () => () => false }));

const PR_ONE = 'https://github.com/OneCommunityGlobal/HighestGoodNetworkApp/pull/5675';
const PR_TWO = 'https://github.com/OneCommunityGlobal/HGNRest/pull/2414';

const makeStore = () =>
  createStore(
    () => ({
      theme: { darkMode: false },
      auth: { user: { userid: 'u1', role: 'Volunteer' } },
    }),
    applyMiddleware(thunk),
  );

const renderButton = ({ task, updateTask }) =>
  render(
    <Provider store={makeStore()}>
      <ReviewButton
        user={{ personId: 'u1', name: 'Ada Lovelace' }}
        task={task}
        updateTask={updateTask}
        onTimeOff={false}
      />
    </Provider>,
  );

const unsubmittedTask = () => ({
  _id: 't1',
  taskName: 'Review link list',
  resources: [{ userID: 'u1', reviewStatus: 'Unsubmitted' }],
  relatedWorkLinks: [],
});

describe('ReviewButton link list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves each link as its own entry', async () => {
    const updateTask = vi.fn();
    renderButton({ task: unsubmittedTask(), updateTask });

    await userEvent.click(screen.getByRole('button', { name: 'Submit for Review' }));
    await userEvent.type(await screen.findByLabelText('Link 1'), PR_ONE);
    await userEvent.click(screen.getByRole('button', { name: 'Add another link' }));
    await userEvent.type(screen.getByLabelText('Link 2'), PR_TWO);
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await screen.findByText(/You are about to submit these links for review/);
    expect(screen.getByText(PR_ONE)).toBeInTheDocument();
    expect(screen.getByText(PR_TWO)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Confirm and Submit' }));

    expect(updateTask).toHaveBeenCalledTimes(1);
    const [taskId, payload] = updateTask.mock.calls[0];
    expect(taskId).toBe('t1');
    expect(payload.relatedWorkLinks).toEqual([PR_ONE, PR_TWO]);
    expect(httpService.post).toHaveBeenCalledTimes(1);
  });

  it('keeps the modal open and shows an error next to a bad row', async () => {
    const updateTask = vi.fn();
    renderButton({ task: unsubmittedTask(), updateTask });

    await userEvent.click(screen.getByRole('button', { name: 'Submit for Review' }));
    await userEvent.type(await screen.findByLabelText('Link 1'), 'not a link');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/starts with https:\/\//);
    expect(screen.queryByText(/You are about to submit/)).not.toBeInTheDocument();
    expect(updateTask).not.toHaveBeenCalled();
  });

  it('moves focus to the first bad link after a failed submit', async () => {
    renderButton({ task: unsubmittedTask(), updateTask: vi.fn() });

    await userEvent.click(screen.getByRole('button', { name: 'Submit for Review' }));
    await userEvent.type(await screen.findByLabelText('Link 1'), PR_ONE);
    await userEvent.click(screen.getByRole('button', { name: 'Add another link' }));
    await userEvent.type(screen.getByLabelText('Link 2'), 'not a link');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(screen.getByLabelText('Link 2')).toHaveFocus());
  });

  it('rejects two links typed into one row', async () => {
    const updateTask = vi.fn();
    renderButton({ task: unsubmittedTask(), updateTask });

    await userEvent.click(screen.getByRole('button', { name: 'Submit for Review' }));
    await userEvent.type(await screen.findByLabelText('Link 1'), `${PR_ONE};${PR_TWO}`);
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/one link in each row/);
    expect(updateTask).not.toHaveBeenCalled();
  });

  it('shows an old "link;link" entry as two named links for the reviewer', async () => {
    const task = {
      ...unsubmittedTask(),
      resources: [{ userID: 'u1', reviewStatus: 'Submitted' }],
      relatedWorkLinks: [`${PR_ONE};${PR_TWO}`],
    };
    renderButton({ task, updateTask: vi.fn() });

    await userEvent.click(screen.getByRole('button', { name: /Ready for Review/ }));
    expect(await screen.findByText(/View HighestGoodNetworkApp PR #5675/)).toBeInTheDocument();
    expect(screen.getByText(/View HGNRest PR #2414/)).toBeInTheDocument();
  });

  it('lists every stored link when editing and saves the edited list', async () => {
    const updateTask = vi.fn(() => Promise.resolve());
    const task = {
      ...unsubmittedTask(),
      resources: [{ userID: 'u1', reviewStatus: 'Submitted' }],
      relatedWorkLinks: [`${PR_ONE};${PR_TWO}`],
    };
    renderButton({ task, updateTask });

    await userEvent.click(screen.getByRole('button', { name: /Ready for Review/ }));
    await userEvent.click(await screen.findByText(/Edit links/));
    expect(await screen.findByLabelText('Link 1')).toHaveValue(PR_ONE);
    expect(screen.getByLabelText('Link 2')).toHaveValue(PR_TWO);

    await userEvent.click(screen.getByRole('button', { name: 'Remove link 2' }));
    await userEvent.click(screen.getByRole('button', { name: 'Update links' }));

    expect(updateTask).toHaveBeenCalledTimes(1);
    expect(updateTask.mock.calls[0][1].relatedWorkLinks).toEqual([PR_ONE]);
    // the task prop is not changed in place
    expect(task.relatedWorkLinks).toEqual([`${PR_ONE};${PR_TWO}`]);
  });
});
