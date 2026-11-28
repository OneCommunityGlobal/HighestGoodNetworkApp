import { toast } from 'react-toastify';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '../../utils/URL';
import { LOG_STUDENT_TASK_HOURS } from '../../constants/studentTasks';
import { fetchStudentTasks, logStudentTaskHours, markStudentTaskAsDone } from '../studentTasks';

vi.mock('../../services/httpService', () => ({ default: { post: vi.fn(), get: vi.fn() } }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => vi.resetAllMocks());

const getState = () => ({ auth: { user: { userid: 'student-id' } } });

it('returns true and preserves the request, Redux update, and success notification', async () => {
  const dispatch = vi.fn();
  const data = {
    loggedHours: 2.5,
    suggestedTotalHours: 5,
    status: 'in_progress',
    canMarkDone: false,
  };
  httpService.post.mockResolvedValue({ data });

  await expect(logStudentTaskHours('task-id', 0.5)(dispatch, getState)).resolves.toBe(true);
  expect(httpService.post).toHaveBeenCalledWith(ENDPOINTS.STUDENT_TASK_LOG_HOURS('task-id'), {
    hours: 0.5,
    requestor: { requestorId: 'student-id' },
  });
  expect(dispatch).toHaveBeenCalledWith({ type: LOG_STUDENT_TASK_HOURS, taskId: 'task-id', ...data });
  expect(toast.success).toHaveBeenCalledWith('0.5 hour(s) logged successfully!');
  expect(toast.error).not.toHaveBeenCalled();
});

it.each([
  [{ response: { data: { error: 'Task is completed' } } }, 'Task is completed'],
  [new Error('Network error'), 'Failed to log hours. Please try again.'],
])('returns false without dispatching or reporting success on failure', async (error, message) => {
  const dispatch = vi.fn();
  httpService.post.mockRejectedValue(error);

  await expect(logStudentTaskHours('task-id', 0.5)(dispatch, getState)).resolves.toBe(false);
  expect(dispatch).not.toHaveBeenCalled();
  expect(toast.success).not.toHaveBeenCalled();
  expect(toast.error).toHaveBeenCalledWith(message);
});

describe('markStudentTaskAsDone eligibility', () => {
  const runCompletion = async task => {
    const dispatch = vi.fn();
    await markStudentTaskAsDone('task-id')(dispatch, () => ({
      ...getState(),
      studentTasks: { taskItems: [{ id: 'task-id', task_type: 'read', logged_hours: 5, ...task }] },
    }));
    return dispatch;
  };

  it.each([0, -1, null, undefined, NaN, Infinity, '5'])(
    'rejects suggested hours %s without calling the API',
    async suggestedHours => {
      const dispatch = await runCompletion({ suggested_total_hours: suggestedHours });
      expect(httpService.post).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Task suggested hours are missing or invalid');
    },
  );

  it('preserves successful Read completion at the hours target', async () => {
    httpService.post.mockResolvedValue({});
    const dispatch = await runCompletion({ suggested_total_hours: 5 });
    expect(httpService.post).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      updatedTask: expect.objectContaining({ status: 'completed', is_completed: true }),
    }));
    expect(toast.success).toHaveBeenCalled();
  });

  it('preserves insufficient-hours rejection', async () => {
    await runCompletion({ suggested_total_hours: 6 });
    expect(httpService.post).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Insufficient hours logged. Required: 6, Logged: 5');
  });

  it('keeps Write completion on the upload workflow', async () => {
    await runCompletion({ task_type: 'write', suggested_total_hours: 5 });
    expect(httpService.post).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Only read tasks can be marked as complete manually');
  });
});


describe('task subtitle mapping', () => {
  const fetchTask = async fields => {
    httpService.get.mockResolvedValue({ data: { tasks: {
      Mathematics: {
        subject: { name: 'Mathematics' },
        colorLevels: { blue: { activityGroups: { reading: {
          tasks: [{ _id: 'task-id', ...fields }],
        } } } },
      },
    } } });
    const dispatch = vi.fn();
    await fetchStudentTasks()(dispatch, getState);
    return dispatch.mock.calls.find(([action]) => action.taskItems)[0].taskItems[0];
  };

  it('prefers the trimmed task name while preserving the subject heading', async () => {
    expect(await fetchTask({ name: '  Read chapter one  ', lessonPlan: { title: 'Lesson' }, atom: { name: 'Atom' } })).toMatchObject({
      subtitle: 'Read chapter one', course_name: 'Mathematics',
    });
  });

  it.each([undefined, null, '', '   ', 42, false, {}, []])('uses existing fallbacks for name %j', async name => {
    expect((await fetchTask({ name, lessonPlan: { title: 'Lesson' }, atom: { name: 'Atom' } })).subtitle).toBe('Lesson');
    expect((await fetchTask({ name, atom: { name: 'Atom' } })).subtitle).toBe('Atom');
    expect((await fetchTask({ name })).subtitle).toBe('No Description');
  });

  it('handles a missing name field', async () => {
    expect((await fetchTask({ lessonPlan: { title: 'Lesson' } })).subtitle).toBe('Lesson');
  });
});
