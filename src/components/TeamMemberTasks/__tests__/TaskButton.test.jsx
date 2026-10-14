import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import TaskButton from '../TaskButton';
import * as taskActions from '../../../actions/task';
import * as userActions from '../../../actions/userManagement';
import * as reducer from '../reducer';

const mockStore = configureMockStore([]);
const task = {
  _id: '1',
  taskName: 'Test Task',
  priority: 'High',
  resources: [],
  isAssigned: true,
  status: 'Incomplete',
  hoursBest: '1',
  hoursWorst: '2',
  hoursMost: '1.5',
  hoursEstimate: '1.5',
  startedDate: '2024-05-20T00:00:00Z',
  dueDate: '2024-05-25T00:00:00Z',
  links: [],
  whyInfo: '',
  intentInfo: '',
  endstateInfo: '',
  classification: '',
  mother: 'MotherTask',
};

vi.mock('../../../actions/task');
vi.mock('../../../actions/userManagement');
vi.mock('../reducer');

// Mock react-redux to spy on useDispatch
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: vi.fn(),
  };
});

describe('TaskButton', () => {
  let store;
  let dispatch;
  let mock;

  beforeEach(() => {
    store = mockStore({});
    dispatch = vi.fn();
    useDispatch.mockReturnValue(dispatch);

    mock = new MockAdapter(axios);
    mock.onPost(/task\/del\/.*/).reply(200);
    mock.onPut(/task\/.*/).reply(200);
    mock.onGet(/user\/profiles/).reply(200, []);
    mock.onGet(/tasks/).reply(200, []);
  });

  afterEach(() => {
    mock.restore();
    vi.clearAllMocks();
  });

  test('renders TaskButton correctly', () => {
    render(
      <Provider store={store}>
        <TaskButton task={task} />
      </Provider>,
    );

    const buttonElement = screen.getByText('X');
    expect(buttonElement).toBeInTheDocument();
  });

  test('calls markAsDone when button is clicked', async () => {
    const updateTaskSpy = vi.spyOn(taskActions, 'updateTask').mockResolvedValue();
    const deleteSelectedTaskSpy = vi.spyOn(reducer, 'deleteSelectedTask').mockResolvedValue();
    const getAllUserProfileSpy = vi.spyOn(userActions, 'getAllUserProfile').mockResolvedValue();
    const fetchAllTasksSpy = vi.spyOn(taskActions, 'fetchAllTasks').mockResolvedValue();

    render(
      <Provider store={store}>
        <TaskButton task={task} />
      </Provider>,
    );

    const buttonElement = screen.getByText('X');
    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(updateTaskSpy).toHaveBeenCalledWith(task._id, {
        taskName: task.taskName,
        priority: task.priority,
        resources: task.resources,
        isAssigned: task.isAssigned,
        status: 'Complete',
        hoursBest: parseFloat(task.hoursBest),
        hoursWorst: parseFloat(task.hoursWorst),
        hoursMost: parseFloat(task.hoursMost),
        estimatedHours: parseFloat(task.hoursEstimate),
        startedDatetime: task.startedDate,
        dueDatetime: task.dueDate,
        links: task.links,
        whyInfo: task.whyInfo,
        intentInfo: task.intentInfo,
        endstateInfo: task.endstateInfo,
        classification: task.classification,
      });
    });

    await waitFor(() => expect(deleteSelectedTaskSpy).toHaveBeenCalledWith(task._id, task.mother));

    await waitFor(() => expect(getAllUserProfileSpy).toHaveBeenCalled());

    await waitFor(() => expect(fetchAllTasksSpy).toHaveBeenCalled());
  });

  test('does not render button when task status is Complete', () => {
    const completedTask = { ...task, status: 'Complete' };

    render(
      <Provider store={store}>
        <TaskButton task={completedTask} />
      </Provider>,
    );

    const buttonElement = screen.queryByText('X');
    expect(buttonElement).not.toBeInTheDocument();
  });
});
