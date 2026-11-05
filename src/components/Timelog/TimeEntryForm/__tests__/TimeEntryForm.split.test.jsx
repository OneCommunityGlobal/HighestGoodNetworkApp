import { Provider } from 'react-redux';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import { TimeEntryForm } from '../TimeEntryForm';
import { ENDPOINTS } from '../../../../utils/URL';
import { splitDraftKey } from '../splitTimeEntryUtils';

vi.mock('axios', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('~/actions/task', () => ({ fetchTeamMembersTask: id => ({ type: 'REFRESH_TASKS', id }) }));
const personId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const batchId = 'server-session-1234567890';
const notes =
  'Implemented and tested the assigned task with isolated fixtures and documented the result https://example.org/pr';
const tasks = ['bbbbbbbbbbbbbbbbbbbbbbbb', 'cccccccccccccccccccccccc'].map((_id, index) => ({
  _id,
  taskName: `Task ${index + 1} fixture`,
  isActive: true,
  projectId: 'dddddddddddddddddddddddd',
  projectName: 'Fixture project',
  wbsId: 'eeeeeeeeeeeeeeeeeeeeeeee',
  wbsName: 'Fixture WBS',
}));
let props;
let store;
const mount = extra =>
  render(
    <Provider store={store}>
      <TimeEntryForm {...props} {...extra} />
    </Provider>,
  );
const fill = async () => {
  fireEvent.click(screen.getByLabelText('Worked on multiple tasks?'));
  await waitFor(() => expect(screen.getByLabelText('Task 1')).toBeEnabled());
  fireEvent.change(screen.getByLabelText('Task 1'), { target: { value: tasks[0]._id } });
  fireEvent.change(screen.getByLabelText('Task 2'), { target: { value: tasks[1]._id } });
  fireEvent.change(screen.getAllByLabelText('Hours')[0], { target: { value: '3' } });
  fireEvent.change(screen.getAllByLabelText('Hours')[1], { target: { value: '2' } });
  screen
    .getAllByLabelText('Work description and reference link')
    .forEach(input => fireEvent.change(input, { target: { value: notes } }));
};
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  store = configureMockStore()({ auth: { user: { userid: personId } } });
  props = {
    from: 'Timer',
    edit: false,
    isOpen: true,
    data: { hours: 5, minutes: 0, notes: '' },
    authUser: { userid: personId },
    darkMode: false,
    timerSessionId: batchId,
    timerConnected: true,
    sessionId: 'client-session',
    toggle: vi.fn(),
    sendStop: vi.fn().mockResolvedValue(true),
    hasPermission: () => false,
    getUserProfile: vi.fn(),
    getTimeEntriesForWeek: vi.fn(),
    onTimeSubmitted: vi.fn(),
  };
  axios.get.mockImplementation(async url => ({
    data: url.includes('/tasks/user/')
      ? tasks
      : url.includes('/projects/user/')
      ? []
      : { isFirstTimelog: false, startDate: '2026-01-01', timeEntryEditHistory: [] },
  }));
  axios.post.mockImplementation(async (_url, body) => ({
    data: { ...body, entryIds: ['one', 'two'] },
  }));
});
it('starts in the original single-entry workflow and allows switching back before submission', async () => {
  mount();
  expect(screen.getByLabelText('Worked on multiple tasks?')).not.toBeChecked();
  expect(screen.getByLabelText('Project/Task')).toBeInTheDocument();
  await fill();
  expect(screen.queryByLabelText('Project/Task')).not.toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Worked on multiple tasks?'));
  expect(screen.getByLabelText('Project/Task')).toBeInTheDocument();
  expect(axios.post).not.toHaveBeenCalled();
});
it('stops only after the batch save and refreshes profile, logs and tasks', async () => {
  mount();
  await fill();
  props.sendStop.mockImplementation(async key => {
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(key).toBe(batchId);
    return true;
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit 2 time entries' }));
  await waitFor(() => expect(props.toggle).toHaveBeenCalledTimes(1));
  expect(props.getUserProfile).toHaveBeenCalledWith(personId);
  expect(props.getTimeEntriesForWeek).toHaveBeenCalledWith(personId, 0);
  expect(store.getActions()).toContainEqual({ type: 'REFRESH_TASKS', id: personId });
  expect(props.onTimeSubmitted).toHaveBeenCalledWith({
    hours: 5,
    minutes: 0,
    sessionId: 'client-session',
  });
});
it('recovers an earlier committed split without stopping a new timer', async () => {
  const payload = {
    personId,
    batchId: 'an-earlier-server-key',
    dateOfWork: '2026-11-05',
    totalMinutes: 300,
    allocations: tasks.map((task, index) => ({
      taskId: task._id,
      minutes: index ? 120 : 180,
      notes,
    })),
  };
  localStorage.setItem(
    splitDraftKey(personId),
    JSON.stringify({
      attempted: true,
      saved: true,
      payload,
      receipt: payload,
      rows: tasks.map((task, index) => ({
        id: String(index),
        taskId: task._id,
        hours: index ? '2' : '3',
        minutes: '0',
        notes,
      })),
    }),
  );
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Finish timer' }));
  await waitFor(() => expect(props.toggle).toHaveBeenCalled());
  expect(props.sendStop).not.toHaveBeenCalled();
  expect(axios.post).not.toHaveBeenCalled();
  expect(props.onTimeSubmitted).not.toHaveBeenCalled();
});
it('does not expose splitting when logging for someone else', async () => {
  sessionStorage.setItem(
    'viewingUser',
    JSON.stringify({ userId: 'ffffffffffffffffffffffff', firstName: 'Another user' }),
  );
  mount();
  await waitFor(() => expect(screen.queryByText('Loading Data...')).not.toBeInTheDocument());
  expect(screen.queryByLabelText('Worked on multiple tasks?')).not.toBeInTheDocument();
});
