import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import SplitTimeEntryForm from '../SplitTimeEntryForm';
import { splitDraftKey } from '../splitTimeEntryUtils';
import { ENDPOINTS } from '../../../../utils/URL';

vi.mock('axios', () => ({ default: { post: vi.fn(), get: vi.fn() } }));
const personId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const tasks = [
  { _id: 'bbbbbbbbbbbbbbbbbbbbbbbb', taskName: 'Terms checkbox' },
  { _id: 'cccccccccccccccccccccccc', taskName: 'Hours hotfix' },
];
const notes =
  'Implemented and tested the assigned task with isolated fixtures and documented the result https://example.org/pr';
let complete;
let lock;
const receipt = () => ({
  batchId: 'server-session-1234567890',
  totalMinutes: 300,
  dateOfWork: '2026-11-05',
  entryIds: ['one', 'two'],
  allocations: tasks.map((task, index) => ({
    taskId: task._id,
    minutes: index ? 120 : 180,
    notes,
  })),
});
const mount = extra =>
  render(
    <SplitTimeEntryForm
      personId={personId}
      batchId="server-session-1234567890"
      dateOfWork="2026-11-05"
      totalMinutes={300}
      tasks={tasks}
      loading={false}
      connected
      darkMode={false}
      onComplete={complete}
      onLockChange={lock}
      {...extra}
    />,
  );
const fill = () => {
  fireEvent.change(screen.getByLabelText('Task 1'), { target: { value: tasks[0]._id } });
  fireEvent.change(screen.getByLabelText('Task 2'), { target: { value: tasks[1]._id } });
  const hours = screen.getAllByLabelText('Hours');
  fireEvent.change(hours[0], { target: { value: '3' } });
  fireEvent.change(hours[1], { target: { value: '2' } });
  screen
    .getAllByLabelText('Work description and reference link')
    .forEach(input => fireEvent.change(input, { target: { value: notes } }));
};
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  complete = vi.fn().mockResolvedValue(true);
  lock = vi.fn();
  axios.post.mockResolvedValue({ data: receipt() });
});

describe('Split timer allocations', () => {
  it('disables submission until all rows are complete and time matches exactly', () => {
    mount();
    expect(screen.getByRole('button', { name: 'Submit 2 time entries' })).toBeDisabled();
    fill();
    expect(screen.getByRole('button', { name: 'Submit 2 time entries' })).toBeEnabled();
    fireEvent.change(screen.getAllByLabelText('Hours')[0], { target: { value: '4' } });
    expect(screen.getByText('Over allocated')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit 2 time entries' })).toBeDisabled();
  });
  it('posts one batch with separate task descriptions and total minutes', async () => {
    mount();
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Submit 2 time entries' }));
    await waitFor(() => expect(complete).toHaveBeenCalledTimes(1));
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      ENDPOINTS.TIME_ENTRY_SPLIT(),
      expect.objectContaining({
        personId,
        totalMinutes: 300,
        batchId: 'server-session-1234567890',
        allocations: receipt().allocations,
      }),
    );
    expect(localStorage.getItem(splitDraftKey(personId))).toBeNull();
  });
  it('keeps and locks the submitted draft on an uncertain failure, then retries the exact payload', async () => {
    axios.post.mockRejectedValueOnce(new Error('Lost response'));
    mount();
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Submit 2 time entries' }));
    const retry = await screen.findByRole('button', { name: 'Retry split save' });
    expect(screen.getByLabelText('Task 1')).toBeDisabled();
    expect(JSON.parse(localStorage.getItem(splitDraftKey(personId))).attempted).toBe(true);
    fireEvent.click(retry);
    await waitFor(() => expect(complete).toHaveBeenCalled());
    expect(axios.post.mock.calls[0][1]).toEqual(axios.post.mock.calls[1][1]);
  });
  it('recovers an uncertain draft after unmount without losing its original session key', async () => {
    axios.post.mockRejectedValueOnce(new Error('offline'));
    const view = mount();
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Submit 2 time entries' }));
    await screen.findByRole('button', { name: 'Retry split save' });
    view.unmount();
    mount({ batchId: 'newer-timer-session' });
    expect(screen.getByLabelText('Task 1')).toHaveValue(tasks[0]._id);
    fireEvent.click(screen.getByRole('button', { name: 'Retry split save' }));
    await waitFor(() => expect(complete).toHaveBeenCalled());
    expect(axios.post.mock.calls[1][1].batchId).toBe('server-session-1234567890');
  });
  it('does not repost entries when timer-stop confirmation fails', async () => {
    complete.mockResolvedValueOnce(false);
    mount();
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Submit 2 time entries' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Finish timer' }));
    await waitFor(() => expect(complete).toHaveBeenCalledTimes(2));
    expect(axios.post).toHaveBeenCalledTimes(1);
  });
  it('refreshes the original receipt if another tab already saved this session', async () => {
    axios.post.mockRejectedValueOnce({ response: { status: 409 } });
    axios.get.mockResolvedValueOnce({ data: receipt() });
    mount();
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Submit 2 time entries' }));
    await waitFor(() => expect(complete).toHaveBeenCalled());
    expect(axios.get).toHaveBeenCalledWith(
      ENDPOINTS.TIME_ENTRY_SPLIT_RECEIPT('server-session-1234567890'),
    );
    expect(axios.post).toHaveBeenCalledTimes(1);
  });
  it('unlocks a rejected request without clearing allocations', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 403, data: { error: 'Task assignment changed' } },
    });
    mount();
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Submit 2 time entries' }));
    await screen.findByText('Task assignment changed');
    expect(screen.getByLabelText('Task 1')).toBeEnabled();
    expect(screen.getAllByLabelText('Hours')[0]).toHaveValue(3);
    expect(complete).not.toHaveBeenCalled();
  });
  it('blocks rapid double-clicks while the request is in flight', async () => {
    let resolve;
    axios.post.mockImplementationOnce(
      () =>
        new Promise(done => {
          resolve = done;
        }),
    );
    mount();
    fill();
    const button = screen.getByRole('button', { name: 'Submit 2 time entries' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(axios.post).toHaveBeenCalledTimes(1);
    resolve({ data: receipt() });
    await waitFor(() => expect(complete).toHaveBeenCalled());
  });
  it.each([{ loading: true }, { connected: false }])(
    'does not submit while unavailable: %j',
    extra => {
      mount(extra);
      expect(screen.getByRole('button', { name: 'Submit 2 time entries' })).toBeDisabled();
      expect(axios.post).not.toHaveBeenCalled();
    },
  );
  it('blocks invalid minutes, missing references and duplicate tasks', () => {
    mount();
    fill();
    fireEvent.change(screen.getAllByLabelText('Minutes')[0], { target: { value: '60' } });
    expect(screen.getByRole('button', { name: 'Submit 2 time entries' })).toBeDisabled();
    fireEvent.change(screen.getAllByLabelText('Minutes')[0], { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Task 2'), { target: { value: tasks[0]._id } });
    expect(screen.getByText('Each task may appear only once.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Task 2'), { target: { value: tasks[1]._id } });
    fireEvent.change(screen.getAllByLabelText('Work description and reference link')[0], {
      target: { value: 'Insufficient notes' },
    });
    expect(screen.getByRole('button', { name: 'Submit 2 time entries' })).toBeDisabled();
  });
  it('fails safely without sending a request when recovery storage is unavailable', () => {
    mount();
    fill();
    vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
      throw new Error('Storage unavailable');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit 2 time entries' }));
    expect(axios.post).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
  });
});
