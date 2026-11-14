import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { logStudentTaskHours } from '../../../../actions/studentTasks';
import HoursLogPanel from '../HoursLogPanel';

vi.mock('react-redux', () => ({ useDispatch: vi.fn() }));
vi.mock('../../../../actions/studentTasks', () => ({ logStudentTaskHours: vi.fn() }));

const task = { id: 'reading-task', logged_hours: 2, suggested_total_hours: 5 };
let dispatch;
let onClose;

beforeEach(() => {
  vi.resetAllMocks();
  dispatch = vi.fn();
  onClose = vi.fn();
  useDispatch.mockReturnValue(dispatch);
  logStudentTaskHours.mockReturnValue('log-hours-action');
});

const renderPanel = (selectedTask = task) =>
  render(<HoursLogPanel task={selectedTask} onClose={onClose} />);

it('closes after success and dispatches the task ID and entered hours', async () => {
  dispatch.mockResolvedValue(true);
  renderPanel();
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Hours to log' }), {
    target: { value: '2.5' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Log Hours' }));

  expect(logStudentTaskHours).toHaveBeenCalledWith('reading-task', 2.5);
  expect(dispatch).toHaveBeenCalledWith('log-hours-action');
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
});

it('keeps the modal open, preserves hours, and enables retry after failure', async () => {
  dispatch.mockResolvedValue(false);
  renderPanel();
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Hours to log' }), {
    target: { value: '3.5' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Log Hours' }));

  await waitFor(() => expect(screen.getByRole('button', { name: 'Log Hours' })).toBeEnabled());
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog', { name: 'Log hours panel' })).toBeInTheDocument();
  expect(screen.getByRole('spinbutton', { name: 'Hours to log' })).toHaveValue(3.5);

  dispatch.mockResolvedValue(true);
  fireEvent.click(screen.getByRole('button', { name: 'Log Hours' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(logStudentTaskHours).toHaveBeenLastCalledWith('reading-task', 3.5);
});

it('prevents duplicate form submissions while pending', async () => {
  let resolveSubmission;
  dispatch.mockReturnValue(
    new Promise(resolve => {
      resolveSubmission = resolve;
    }),
  );
  renderPanel();
  const input = screen.getByRole('spinbutton', { name: 'Hours to log' });

  // Submit the form directly to cover keyboard submits as well as button clicks.
  fireEvent.submit(input.form);
  fireEvent.submit(input.form);

  expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  expect(dispatch).toHaveBeenCalledTimes(1);
  expect(logStudentTaskHours).toHaveBeenCalledTimes(1);
  expect(onClose).not.toHaveBeenCalled();
  await act(async () => resolveSubmission(true));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('uses _id when id is absent', async () => {
  dispatch.mockResolvedValue(true);
  renderPanel({ ...task, id: undefined, _id: 'fallback-task' });
  fireEvent.click(screen.getByRole('button', { name: 'Log Hours' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(logStudentTaskHours).toHaveBeenCalledWith('fallback-task', 1);
});

it('preserves Escape keyboard dismissal', () => {
  renderPanel();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledTimes(1);
});
