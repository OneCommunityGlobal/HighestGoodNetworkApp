import { toast } from 'react-toastify';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '../../utils/URL';
import { LOG_STUDENT_TASK_HOURS } from '../../constants/studentTasks';
import { logStudentTaskHours } from '../studentTasks';

vi.mock('../../services/httpService', () => ({ default: { post: vi.fn() } }));
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
