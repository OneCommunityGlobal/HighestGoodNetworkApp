import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider, useSelector } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import axios from 'axios';
import AddTaskModal from '../AddTask/AddTaskModal';
import { projectMembershipReducer } from '../../../../../reducers/projectMembershipReducer';
import { addNewTask } from '../../../../../actions/task';
import { ENDPOINTS } from '../../../../../utils/URL';

vi.mock('axios');
vi.mock('../../../../../actions/task', () => ({
  addNewTask: vi.fn(() => async () => {}),
}));
vi.mock('../../../../../actions/projects', () => ({
  fetchAllProjects: vi.fn(() => async () => {}),
}));
vi.mock('../../../../../actions/project', () => ({
  getProjectDetail: vi.fn(() => async () => {}),
}));
vi.mock('@tinymce/tinymce-react', () => ({
  Editor: ({ value, onEditorChange }) => (
    <textarea aria-label="Task details editor" value={value} onChange={e => onEditorChange(e.target.value)} />
  ),
}));

const ada = { _id: 'ada', firstName: 'Ada', lastName: 'Active', isActive: true };
const ben = { _id: 'ben', firstName: 'Ben', lastName: 'Active', isActive: true };
const inactive = { _id: 'inactive', firstName: 'Ina', lastName: 'Inactive', isActive: false };
const projectId = 'project-one';
const existingTask = { _id: 'existing', num: '1', level: 1 };

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

function openForm(darkMode = false) {
  const membersResponse = deferred();
  axios.get.mockImplementation(url => {
    if (url === ENDPOINTS.PROJECT_MEMBER(projectId)) return membersResponse.promise;
    return Promise.resolve({ data: [] });
  });
  const initialState = {
    tasks: { taskItems: [], copiedTask: null, error: null },
    projectMembers: { members: [ada, ben, inactive], foundUsers: [], foundProjectMembers: [] },
    allProjects: { projects: [{ _id: projectId, category: 'Housing' }], fetched: true },
    projectById: { _id: projectId, category: 'Housing' },
    theme: { darkMode },
  };
  const store = createStore((state = initialState, action) => ({
    ...state,
    projectMembers: projectMembershipReducer(state.projectMembers, action),
    tasks: action.type === 'TEST_TASKS_LOADED'
      ? { ...state.tasks, taskItems: action.tasks }
      : action.type === 'TEST_TASK_ERROR'
        ? { ...state.tasks, error: action.error }
        : state.tasks,
  }), applyMiddleware(thunk));
  const load = vi.fn();
  function Harness() {
    const tasks = useSelector(state => state.tasks.taskItems);
    return <AddTaskModal tasks={tasks} projectId={projectId} wbsId="wbs-one" load={load} />;
  }
  render(<Provider store={store}><Harness /></Provider>);
  fireEvent.click(screen.getByRole('button', { name: 'Add Task' }));
  return { store, membersResponse, load };
}

function selectResource(name = 'Ada Active') {
  fireEvent.focus(screen.getByPlaceholderText('Add resources'));
  fireEvent.mouseDown(screen.getByRole('button', { name }));
}

function expectSelected(name = 'Ada Active') {
  expect(screen.getByText(name, { selector: 'small' })).toBeInTheDocument();
  expect(screen.getByLabelText('Yes')).toBeChecked();
}

beforeEach(() => {
  vi.clearAllMocks();
  addNewTask.mockImplementation(task => async () => ({ ...task, _id: 'saved-task' }));
});

describe('Add Task resource selection during background loading', () => {
  it.each([false, true])('keeps the draft when a delayed task list arrives (dark=%s)', async dark => {
    const { store } = openForm(dark);
    fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: 'Keep my draft' } });
    fireEvent.change(screen.getAllByLabelText('Task details editor')[0], { target: { value: 'Keep my notes' } });
    selectResource();
    act(() => store.dispatch({ type: 'TEST_TASKS_LOADED', tasks: [existingTask] }));
    expectSelected();
    expect(screen.getByLabelText('Task Name')).toHaveValue('Keep my draft');
    expect(screen.getAllByLabelText('Task details editor')[0]).toHaveValue('Keep my notes');
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.PROJECT_MEMBER(projectId));
  });

  it.each([false, true])('keeps the input, focus and selected resource when member count changes (dark=%s)', async dark => {
    const { membersResponse } = openForm(dark);
    selectResource();
    const input = screen.getByPlaceholderText('Add resources');
    input.focus();
    fireEvent.change(input, { target: { value: 'Be' } });
    await act(async () => membersResponse.resolve({ data: [ada, ben, inactive, { ...ada, _id: 'new', firstName: 'New' }] }));
    expectSelected();
    expect(screen.getByPlaceholderText('Add resources')).toBe(input);
    expect(input).toHaveFocus();
    expect(input).toHaveValue('Be');
    expect(screen.getByRole('button', { name: 'Ben Active' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ina Inactive' })).not.toBeInTheDocument();
  });

  it('retains the selection after a failed member refresh', async () => {
    const { membersResponse } = openForm();
    selectResource();
    await act(async () => membersResponse.reject(new Error('Mocked slow request failed')));
    expectSelected();
  });

  it('refreshes outdated data without discarding the draft when the error clears', () => {
    const { store, load } = openForm();
    selectResource();
    act(() => store.dispatch({ type: 'TEST_TASK_ERROR', error: 'outdated' }));
    expect(load).toHaveBeenCalledTimes(1);
    act(() => store.dispatch({ type: 'TEST_TASK_ERROR', error: null }));
    expectSelected();
  });

  it('saves the remaining selected resource after removal and a delayed task update', async () => {
    const { store } = openForm();
    fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: 'Assignment fixture' } });
    selectResource();
    selectResource('Ben Active');
    fireEvent.click(screen.getByText('Ada Active', { selector: 'small' }));
    act(() => store.dispatch({ type: 'TEST_TASKS_LOADED', tasks: [existingTask] }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(addNewTask).toHaveBeenCalled());
    expect(addNewTask.mock.calls[0][0]).toMatchObject({
      taskName: 'Assignment fixture', num: '2', isAssigned: true,
      resources: [{ userID: 'ben', name: 'Ben Active' }],
    });
  });

  it('still clears resources and assignment when Reset is explicitly clicked', () => {
    openForm();
    selectResource();
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.queryByText('Ada Active', { selector: 'small' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('No')).toBeChecked();
  });

  it('starts a fresh draft after closing and reopening', async () => {
    openForm();
    selectResource();
    fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: 'Cancelled draft' } });
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Add Task' }));
    expect(screen.queryByText('Ada Active', { selector: 'small' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Task Name')).toHaveValue('');
    expect(screen.getByLabelText('No')).toBeChecked();
  });

  it('preserves resources through repeated task refreshes without an outdated reload loop', () => {
    const { store, load } = openForm();
    selectResource();
    act(() => store.dispatch({ type: 'TEST_TASK_ERROR', error: 'outdated' }));
    for (const tasks of [[existingTask], [], [existingTask, { ...existingTask, _id: 'second', num: '2' }]]) {
      act(() => store.dispatch({ type: 'TEST_TASKS_LOADED', tasks }));
      expectSelected();
    }
    expect(load).toHaveBeenCalledTimes(1);
  });

  it.each([[], [inactive]])('does not discard the selection or offer inactive users after an empty active-member refresh (%j)', async members => {
    const { membersResponse } = openForm();
    selectResource();
    await act(async () => membersResponse.resolve({ data: members }));
    expectSelected();
    fireEvent.focus(screen.getByPlaceholderText('Add resources'));
    expect(screen.queryByRole('button', { name: 'Ina Inactive' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ada Active' })).not.toBeInTheDocument();
  });

  it('does not restore a removed resource when delayed data arrives', async () => {
    const { store, membersResponse } = openForm();
    selectResource();
    fireEvent.click(screen.getByText('Ada Active', { selector: 'small' }));
    await act(async () => membersResponse.resolve({ data: [ada, ben, inactive] }));
    act(() => store.dispatch({ type: 'TEST_TASKS_LOADED', tasks: [existingTask] }));
    expect(screen.queryByText('Ada Active', { selector: 'small' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('No')).toBeChecked();
  });

  it('keeps the draft when a non-outdated error arrives and clears', () => {
    const { store, load } = openForm();
    selectResource();
    act(() => store.dispatch({ type: 'TEST_TASK_ERROR', error: 'Mocked request failure' }));
    act(() => store.dispatch({ type: 'TEST_TASK_ERROR', error: null }));
    expectSelected();
    expect(load).not.toHaveBeenCalled();
  });

  it('does not restore a cancelled selection when a pending member response arrives after reopening', async () => {
    const { membersResponse } = openForm();
    selectResource();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Add Task' }));
    await act(async () => membersResponse.resolve({ data: [ada, ben, inactive] }));
    expect(screen.queryByText('Ada Active', { selector: 'small' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('No')).toBeChecked();
  });

  it('retains the draft during a pending save and blocks a second Save click', async () => {
    const { store } = openForm();
    const savedResponse = deferred();
    addNewTask.mockImplementationOnce(() => () => savedResponse.promise);
    selectResource();
    fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: 'Pending save' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('button', { name: 'Adding Task...' })).toBeDisabled();
    act(() => store.dispatch({ type: 'TEST_TASKS_LOADED', tasks: [existingTask] }));
    expectSelected();
    fireEvent.click(screen.getByRole('button', { name: 'Adding Task...' }));
    expect(addNewTask).toHaveBeenCalledTimes(1);
    await act(async () => savedResponse.resolve());
  });
});
