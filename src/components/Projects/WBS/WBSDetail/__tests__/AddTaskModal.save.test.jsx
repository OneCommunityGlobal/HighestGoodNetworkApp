import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConnectedAddTask from '../AddTask/AddTaskModal';
import { addNewTask } from '../../../../../actions/task';
import { ENDPOINTS } from '../../../../../utils/URL';

vi.mock('axios');
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), info: vi.fn() } }));
vi.mock('@tinymce/tinymce-react', () => ({ Editor: () => <div /> }));

function openDraft(saveOverride) {
  const member = { _id: 'ada', firstName: 'Ada', lastName: 'Active', isActive: true };
  const state = { theme: { darkMode: false }, projectMembers: { members: [member], foundProjectMembers: [] } };
  const store = createStore(s => s, state, applyMiddleware(thunk));
  const AddTask = ConnectedAddTask.WrappedComponent;
  const load = vi.fn();
  render(<Provider store={store}><AddTask tasks={[]} allMembers={[member]} copiedTask={null}
    projectId="synthetic-project" wbsId="synthetic-wbs" pageLoadTime={Date.now()}
    allProjects={{ projects: [], fetched: true }} error={null} darkMode={false}
    fetchAllProjects={() => {}} fetchAllMembers={() => {}} getProjectDetail={() => {}}
    addNewTask={saveOverride || ((...args) => store.dispatch(addNewTask(...args)))} load={load}
  /></Provider>);
  fireEvent.click(screen.getByRole('button', { name: 'Add Task' }));
  fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: 'Keep this draft' } });
  fireEvent.focus(screen.getByPlaceholderText('Add resources'));
  fireEvent.mouseDown(screen.getByRole('button', { name: 'Ada Active' }));
  return load;
}

async function save() {
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  // Check after Reactstrap's closing transition, not against transient DOM.
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 400)); });
}

function expectDraft() {
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  expect(screen.getByLabelText('Task Name')).toHaveValue('Keep this draft');
  expect(screen.getByText('Ada Active', { selector: 'small' })).toBeInTheDocument();
  expect(screen.getByLabelText('Yes')).toBeChecked();
}

beforeEach(() => {
  vi.clearAllMocks();
  axios.get.mockReset().mockResolvedValue({ data: { modifiedDatetime: '2000-01-01' } });
  axios.post.mockReset().mockImplementation(async (url, task) => {
    if (url === ENDPOINTS.TASK('synthetic-wbs')) return { status: 201, data: { ...task, _id: 'saved-task' } };
    return { data: {} };
  });
});

it('keeps the draft after a failed task POST and permits a successful retry', async () => {
  axios.post.mockRejectedValueOnce(new Error('Isolated HTTP 500'));
  const load = openDraft();
  await save();
  expectDraft();
  expect(load).not.toHaveBeenCalled();
  expect(toast.error).toHaveBeenCalledWith('Failed to add new task');
  await save();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(load).toHaveBeenCalledTimes(1);
  expect(axios.post.mock.calls.filter(([url]) => url === ENDPOINTS.TASK('synthetic-wbs'))).toHaveLength(2);
  expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.TASK('synthetic-wbs'), expect.objectContaining({
    taskName: 'Keep this draft', resources: [expect.objectContaining({ userID: 'ada' })], isAssigned: true,
  }));
  fireEvent.click(screen.getByRole('button', { name: 'Add Task' }));
  expect(screen.getByLabelText('Task Name')).toHaveValue('');
  expect(screen.queryByText('Ada Active', { selector: 'small' })).not.toBeInTheDocument();
});

it('keeps the draft when the WBS request fails before posting the task', async () => {
  axios.get.mockRejectedValueOnce(new Error('Isolated WBS failure'));
  const load = openDraft();
  await save();
  expectDraft();
  expect(axios.post).not.toHaveBeenCalled();
  expect(load).not.toHaveBeenCalled();
});

it('restores Save and retains the draft if the save callback unexpectedly rejects', async () => {
  const load = openDraft(vi.fn().mockRejectedValue(new Error('Unexpected failure')));
  await save();
  expectDraft();
  expect(load).not.toHaveBeenCalled();
  expect(toast.error).toHaveBeenCalledWith('Failed to add new task');
});

it('finishes a successful save even if its notification request fails', async () => {
  axios.post.mockImplementation(async (url, task) => {
    if (url === ENDPOINTS.TASK('synthetic-wbs')) return { status: 201, data: { ...task, _id: 'saved-task' } };
    throw new Error('Isolated notification failure');
  });
  const load = openDraft();
  await save();
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(load).toHaveBeenCalledTimes(1);
  expect(axios.post).toHaveBeenCalledTimes(2);
  expect(axios.post).toHaveBeenLastCalledWith(ENDPOINTS.CREATE_OR_UPDATE_TASK_NOTIFICATION('saved-task'), {
    oldTask: {}, userIds: ['ada'],
  });
  expect(toast.info).toHaveBeenCalledTimes(1);
  expect(toast.error).not.toHaveBeenCalled();
});
