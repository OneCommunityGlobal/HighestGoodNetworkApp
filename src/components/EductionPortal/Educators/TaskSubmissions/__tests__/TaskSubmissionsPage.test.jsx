import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import TaskSubmissionsPage from '../TaskSubmissionsPage';
import { getGroups, getGroupMembers } from '~/services/studentGroupsService';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
vi.mock('~/services/httpService', () => ({ default: {} }));
vi.mock('../SubmissionCard', () => ({
  default: ({ submission }) => <div>{submission.studentName}</div>,
}));
vi.mock('~/services/studentGroupsService', async () => ({
  ...(await vi.importActual('~/services/studentGroupsService')),
  getGroups: vi.fn(),
  getGroupMembers: vi.fn(),
}));
const rows = [
  {
    _id: 't1',
    studentId: 's1',
    studentName: 'Alice',
    lessonPlanId: 'c1',
    lessonPlanTitle: 'Art',
    taskName: 'Essay',
  },
  {
    _id: 't2',
    studentId: 's2',
    studentName: 'Bob',
    lessonPlanId: 'c1',
    lessonPlanTitle: 'Art',
    taskName: 'Essay',
  },
  {
    _id: 't3',
    studentId: 's1',
    studentName: 'Alice Science',
    lessonPlanId: 'c2',
    lessonPlanTitle: 'Science',
    taskName: 'Essay',
  },
];
const members = ids => ids.map(id => ({ student_id: { _id: id } }));
beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
  axios.get.mockResolvedValue({ data: rows });
  getGroups.mockResolvedValue([
    { id: 'g1', name: 'Readers' },
    { id: 'g2', name: 'Writers' },
  ]);
  getGroupMembers.mockResolvedValue(members(['s1']));
});
async function selectGroup(id = 'g1') {
  await screen.findByRole('option', { name: 'Readers' });
  fireEvent.change(screen.getByLabelText('Filter by Student Group'), { target: { value: id } });
}

test('group, course and status filters combine while All students restores the full list', async () => {
  render(<TaskSubmissionsPage />);
  await screen.findByText('Bob');
  await selectGroup();
  await waitFor(() => expect(screen.queryByText('Bob')).not.toBeInTheDocument());
  expect(await screen.findByText('Alice')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Science' }));
  expect(screen.getByText('Alice Science')).toBeInTheDocument();
  expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  axios.get.mockResolvedValue({ data: [rows[1]] });
  fireEvent.change(screen.getByLabelText('Filter Submissions'), { target: { value: 'graded' } });
  await waitFor(() => expect(screen.getByLabelText('Filter Submissions')).not.toBeDisabled());
  expect(axios.get).toHaveBeenLastCalledWith(expect.stringContaining('/task-submissions'), {
    params: { status: 'graded' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Art' }));
  expect(screen.getByText('No tasks in this course match the current filter.')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Filter by Student Group'), { target: { value: '' } });
  expect(screen.getByText('Bob')).toBeInTheDocument();
});

test('successful empty membership is distinct from loading and no matching tasks', async () => {
  getGroupMembers.mockResolvedValue([]);
  render(<TaskSubmissionsPage />);
  await selectGroup();
  expect(await screen.findByText('This group has no members.')).toBeInTheDocument();
  expect(screen.queryByText('Alice')).not.toBeInTheDocument();
});

test('membership failure hides submissions and can be retried', async () => {
  getGroupMembers.mockRejectedValueOnce(new Error('Read failed'));
  render(<TaskSubmissionsPage />);
  await selectGroup();
  await screen.findByText('Could not load group members.');
  expect(screen.queryByText('This group has no members.')).not.toBeInTheDocument();
  expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry members' }));
  expect(await screen.findByText('Alice')).toBeInTheDocument();
  expect(getGroupMembers).toHaveBeenCalledTimes(2);
});

test('late response for a previous group cannot replace current memberships', async () => {
  let resolve;
  getGroupMembers.mockReturnValueOnce(
    new Promise(done => {
      resolve = done;
    }),
  );
  render(<TaskSubmissionsPage />);
  await selectGroup();
  expect(screen.getByText('Loading group members…')).toBeInTheDocument();
  expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  getGroupMembers.mockResolvedValueOnce(members(['s2']));
  await selectGroup('g2');
  expect(await screen.findByText('Bob')).toBeInTheDocument();
  await act(async () => resolve(members(['s1'])));
  expect(screen.getByText('Bob')).toBeInTheDocument();
  expect(screen.queryByText('Alice')).not.toBeInTheDocument();
});

test('group list failure does not hide All students and supports retry', async () => {
  getGroups.mockRejectedValueOnce(new Error('Read failed'));
  render(<TaskSubmissionsPage />);
  expect(await screen.findByText('Bob')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry groups' }));
  await screen.findByRole('option', { name: 'Readers' });
  expect(getGroups).toHaveBeenCalledTimes(2);
});

const storageKey = 'educatorTaskSubmissions:lastView';
function restoreView(groupId) {
  sessionStorage.setItem(
    storageKey,
    JSON.stringify({
      groupId,
      activeClassId: 'c2',
      filterStatus: 'graded',
      expandedTasks: { Essay: true },
    }),
  );
}

test('deleted saved group resets only after a successful group fetch and persists All students', async () => {
  restoreView('deleted');
  let resolve;
  getGroups.mockReturnValueOnce(
    new Promise(done => {
      resolve = done;
    }),
  );
  render(<TaskSubmissionsPage />);
  await screen.findByLabelText('Filter by Student Group');
  expect(screen.getByLabelText('Filter by Student Group')).toHaveValue('deleted');
  expect(JSON.parse(sessionStorage.getItem(storageKey)).groupId).toBe('deleted');
  await act(async () => resolve([{ id: 'g1', name: 'Readers' }]));
  expect(screen.getByLabelText('Filter by Student Group')).toHaveValue('');
  expect(screen.queryByRole('option', { name: /Saved group/ })).not.toBeInTheDocument();
  await waitFor(() =>
    expect(JSON.parse(sessionStorage.getItem(storageKey))).toMatchObject({
      groupId: '',
      activeClassId: 'c2',
      filterStatus: 'graded',
    }),
  );
  expect(screen.getByText('Alice Science')).toBeInTheDocument();
});

test('valid saved group and course/status filters remain selected', async () => {
  restoreView('g1');
  render(<TaskSubmissionsPage />);
  await screen.findByRole('option', { name: 'Readers' });
  expect(screen.getByLabelText('Filter by Student Group')).toHaveValue('g1');
  expect(screen.getByLabelText('Filter Submissions')).toHaveValue('graded');
  expect(JSON.parse(sessionStorage.getItem(storageKey))).toMatchObject({
    groupId: 'g1',
    activeClassId: 'c2',
    filterStatus: 'graded',
  });
});

test('failed group fetch retains saved selection until a successful retry confirms deletion', async () => {
  restoreView('deleted');
  getGroups.mockRejectedValueOnce(new Error('Offline'));
  render(<TaskSubmissionsPage />);
  const retry = await screen.findByRole('button', { name: 'Retry groups' });
  expect(screen.getByLabelText('Filter by Student Group')).toHaveValue('deleted');
  expect(JSON.parse(sessionStorage.getItem(storageKey)).groupId).toBe('deleted');
  fireEvent.click(retry);
  await waitFor(() => expect(screen.getByLabelText('Filter by Student Group')).toHaveValue(''));
  expect(JSON.parse(sessionStorage.getItem(storageKey)).groupId).toBe('');
});

test('invalid saved group never fetches members before or after group verification', async () => {
  restoreView('deleted-group');
  let resolve;
  getGroups.mockReturnValueOnce(
    new Promise(done => {
      resolve = done;
    }),
  );
  render(<TaskSubmissionsPage />);
  await screen.findByLabelText('Filter by Student Group');
  expect(getGroupMembers).not.toHaveBeenCalled();
  await act(async () => resolve([{ id: 'g1', name: 'Readers' }]));
  expect(screen.getByLabelText('Filter by Student Group')).toHaveValue('');
  expect(getGroupMembers).not.toHaveBeenCalled();
});
