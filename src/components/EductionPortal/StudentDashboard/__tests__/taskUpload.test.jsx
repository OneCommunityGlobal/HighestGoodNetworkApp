import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { toast } from 'react-toastify';
import httpService from '../../../../services/httpService';
import { studentTasksReducer } from '../../../../reducers/studentTasksReducer';
import { uploadStudentTaskFile, fetchStudentTasks } from '../../../../actions/studentTasks';
import TaskCard from '../TaskCard';
import TaskListItem from '../TaskListItem';
import StudentDashboard from '../StudentDashboard';

vi.mock('../../../../services/httpService', () => ({ default: { post: vi.fn(), get: vi.fn() } }));
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));
vi.mock('../NavigationBar', () => ({ default: () => null }));
vi.mock('../SummaryCards', () => ({ default: () => null }));
vi.mock('../../../../actions/intermediateTasks', () => ({
  fetchIntermediateTasks: () => async () => [],
  markIntermediateTaskAsDone: vi.fn(),
}));

const task = {
  id: 'write-task',
  task_type: 'write',
  status: 'in_progress',
  logged_hours: 3,
  suggested_total_hours: 5,
  course_name: 'Mathematics',
  created_at: '2026-10-27',
};
const file = new File(['submission'], 'answer.txt', { type: 'text/plain' });
const completed = {
  status: 'completed',
  loggedHours: 5,
  suggestedTotalHours: 5,
  url: 'https://example.com/file',
  completedAt: '2026-10-27',
};
const grouped = status => ({
  data: {
    tasks: {
      Mathematics: {
        subject: { name: 'Mathematics' },
        colorLevels: {
          blue: {
            activityGroups: {
              writing: {
                tasks: [
                  {
                    _id: task.id,
                    type: 'write',
                    status,
                    loggedHours: status === 'completed' ? 5 : 3,
                    suggestedTotalHours: 5,
                    assignedAt: '2026-10-27',
                    uploadUrls: status === 'completed' ? [completed.url] : [],
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
});
let store;
beforeEach(() => {
  vi.resetAllMocks();
  store = createStore(
    (state, action) => ({
      theme: { darkMode: false },
      studentTasks: studentTasksReducer(
        state?.studentTasks || { taskItems: [task], fetching: false, error: 'none' },
        action,
      ),
    }),
    applyMiddleware(thunk),
  );
  httpService.post.mockResolvedValue({ data: completed });
  httpService.get.mockResolvedValue(grouped('completed'));
});
const mount = element => render(<Provider store={store}>{element}</Provider>);
const chooseFile = () =>
  fireEvent.change(screen.getByLabelText('Submission file'), { target: { files: [file] } });

it.each([TaskCard, TaskListItem])(
  'shows upload only for eligible write tasks in each view',
  Component => {
    const { rerender } = mount(<Component task={task} />);
    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
    for (const overrides of [
      { task_type: 'read' },
      { status: 'completed' },
      { status: 'graded' },
      { is_completed: true },
    ]) {
      rerender(
        <Provider store={store}>
          <Component task={{ ...task, ...overrides }} />
        </Provider>,
      );
      expect(screen.queryByRole('button', { name: 'Upload' })).not.toBeInTheDocument();
    }
  },
);

it.each(['Card view', 'List view'])(
  'uploads, refreshes, and shows 100% in Completed from %s',
  async view => {
    httpService.get.mockResolvedValueOnce(grouped('in_progress'));
    mount(<StudentDashboard />);
    fireEvent.click(await screen.findByRole('button', { name: view }));
    fireEvent.click(await screen.findByRole('button', { name: 'Upload' }));
    chooseFile();
    fireEvent.click(screen.getByRole('button', { name: 'Submit file' }));
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: /Completed/ })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    );
    expect(screen.getByText('Progress: 5 / 5 hrs (100%)')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(httpService.get).toHaveBeenCalledTimes(2);
    const [endpoint, body, config] = httpService.post.mock.calls[0];
    expect(endpoint).toMatch(/\/student\/tasks\/write-task\/upload$/);
    expect(body).toBeInstanceOf(FormData);
    expect(body.get('file')).toBe(file);
    expect(config.headers['Content-Type']).toBeUndefined();
  },
);

it('preserves file and permits retry after a failed upload', async () => {
  httpService.post.mockRejectedValueOnce({ response: { data: { error: 'Storage unavailable' } } });
  mount(<TaskListItem task={task} />);
  fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
  chooseFile();
  fireEvent.click(screen.getByRole('button', { name: 'Submit file' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Storage unavailable');
  expect(screen.getByLabelText('Submission file').files[0]).toBe(file);
  expect(screen.getByRole('button', { name: 'Submit file' })).toBeEnabled();
  expect(httpService.get).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Submit file' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(httpService.post).toHaveBeenCalledTimes(2);
});

it('blocks duplicate submissions while pending', async () => {
  let resolveUpload;
  httpService.post.mockReturnValue(
    new Promise(resolve => {
      resolveUpload = resolve;
    }),
  );
  mount(<TaskCard task={task} />);
  fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
  chooseFile();
  const input = screen.getByLabelText('Submission file');
  fireEvent.submit(input.form);
  fireEvent.submit(input.form);
  expect(httpService.post).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Uploading…' })).toBeDisabled();
  await act(async () => resolveUpload({ data: completed }));
});

it('retains confirmed completion when refresh fails', async () => {
  httpService.get.mockRejectedValue(new Error('Offline'));
  await expect(store.dispatch(uploadStudentTaskFile(task.id, file))).resolves.toEqual({
    success: true,
  });
  expect(store.getState().studentTasks.taskItems[0]).toMatchObject({
    status: 'completed',
    logged_hours: 5,
  });
  expect(toast.warning).toHaveBeenCalled();
});

it('rejects unsupported files before making a request', async () => {
  mount(<TaskCard task={task} />);
  fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
  fireEvent.change(screen.getByLabelText('Submission file'), {
    target: { files: [new File(['bad'], 'bad.js', { type: 'application/javascript' })] },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit file' }));
  expect(screen.getByRole('alert')).toHaveTextContent('no larger than 10 MB');
  expect(httpService.post).not.toHaveBeenCalled();
});

afterEach(() => vi.unstubAllEnvs());

it('simulates only after opt-in, labels completion, and restores API data on refresh', async () => {
  vi.stubEnv('DEV', true);
  httpService.get.mockResolvedValue(grouped('in_progress'));
  mount(<StudentDashboard />);
  fireEvent.click(await screen.findByRole('button', { name: 'Upload' }));
  const checkbox = screen.getByRole('checkbox', { name: /Simulate upload locally/ });
  expect(checkbox).not.toBeChecked();
  fireEvent.click(checkbox);
  chooseFile();
  const readsBefore = httpService.get.mock.calls.length;
  fireEvent.click(screen.getByRole('button', { name: 'Submit file' }));
  await waitFor(() =>
    expect(screen.getByRole('tab', { name: /Completed/ })).toHaveAttribute('aria-selected', 'true'),
  );
  expect(screen.getByText('Simulated completion — not saved')).toBeInTheDocument();
  expect(screen.getByText('Progress: 5 / 5 hrs (100%)')).toBeInTheDocument();
  expect(httpService.post).not.toHaveBeenCalled();
  expect(httpService.get).toHaveBeenCalledTimes(readsBefore);
  expect(store.getState().studentTasks.taskItems[0]).toMatchObject({
    status: 'completed',
    logged_hours: 5,
    completedAt: expect.any(String),
    simulated_upload: true,
  });
  expect(toast.info).toHaveBeenCalledWith(expect.stringContaining('Simulated upload only'));
  await act(async () => store.dispatch(fetchStudentTasks()));
  expect(store.getState().studentTasks.taskItems[0]).toMatchObject({
    status: 'in_progress',
    logged_hours: 3,
  });
  expect(store.getState().studentTasks.taskItems[0].simulated_upload).toBeUndefined();
});

it('does not offer simulation in production', () => {
  vi.stubEnv('DEV', false);
  mount(<TaskCard task={task} />);
  fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
  expect(
    screen.queryByRole('checkbox', { name: /Simulate upload locally/ }),
  ).not.toBeInTheDocument();
});

it('validates files before simulation', () => {
  vi.stubEnv('DEV', true);
  mount(<TaskCard task={task} />);
  fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
  fireEvent.click(screen.getByRole('checkbox', { name: /Simulate upload locally/ }));
  fireEvent.change(screen.getByLabelText('Submission file'), {
    target: { files: [new File(['bad'], 'bad.js', { type: 'application/javascript' })] },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit file' }));
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(store.getState().studentTasks.taskItems[0].status).toBe('in_progress');
  expect(httpService.post).not.toHaveBeenCalled();
});
