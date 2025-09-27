import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { configureStore } from 'redux-mock-store';
import { TaskDifferenceModal } from '../TaskDifferenceModal';

const mockStore = configureStore([thunk]);

const theme = { darkMode: false };

let store;

beforeEach(() => {
  store = mockStore({
    theme,
  });
  onApproveMock.mockClear();
  toggleMock.mockClear();
});

const onApproveMock = vi.fn();
const toggleMock = vi.fn();
const taskNotifications = [
  {
    userId: 'abc123',
    _id: 'id123',
    taskId: 'task123',
    oldTask: {
      taskName: 'task 1',
      priority: 'Primary',
      resources: [],
      isAssigned: true,
      status: 'Complete',
      hoursBest: 10,
      hoursWorst: 13,
      hoursMost: 13,
      estimatedHours: 11,
      links: [],
      classification: 'Example',
      whyInfo: 'some reason',
      intentInfo: 'Food',
      endstateInfo: 'undefined',
      startedDatetime: null,
      dueDatetime: null,
    },
  },
  {
    userId: 'def123',
    _id: 'id456',
    taskId: 'task456',
  },
];
const task = {};
const loggedInUserId = 'abc123';

const renderComponent = (isOpen, userId, taskNotificationsMock) => {
  return render(
    <Provider store={store}>
      <TaskDifferenceModal
        taskNotifications={taskNotificationsMock}
        task={task}
        onApprove={onApproveMock}
        userId={userId}
        isOpen={isOpen}
        toggle={toggleMock}
        loggedInUserId={loggedInUserId}
        darkMode={theme}
      />
    </Provider>,
  );
};

describe('TaskDifferenceModal component', () => {
  it('check if Mark as read button gets displayed when logged in user id is same as user id', () => {
    renderComponent(true, 'abc123', taskNotifications);
    const readButton = screen.getByText('Mark as read');
    fireEvent.click(readButton);
    expect(onApproveMock).toHaveBeenCalled();
  });
  it('check if Mark as read button does not get displayed when logged in user id is not same as user id', () => {
    renderComponent(true, 'def123', taskNotifications);
    expect(screen.queryByText('Mark as read')).not.toBeInTheDocument();
    expect(onApproveMock).not.toHaveBeenCalled();
  });
  it('check if modal is open when isOpen is set to true', () => {
    renderComponent(true, 'abc123', taskNotifications);
    expect(screen.getByText('Task Info Changes')).toBeInTheDocument();
  });
  it('check if modal is not open when isOpen is set to false', () => {
    renderComponent(false, 'abc123', taskNotifications);
    expect(screen.queryByText('Task Info Changes')).not.toBeInTheDocument();
  });
  it('check if modal body does get displayed when task notification user id is same as user id', () => {
    renderComponent(true, 'abc123', taskNotifications);
    expect(screen.getByText('White Bold = No Changes')).toBeInTheDocument();
  });
  it('check if modal body does not get displayed when task notification user id is not same as user id', () => {
    renderComponent(true, 'ghi123', taskNotifications);
    expect(screen.queryByText('White Bold = No Changes')).not.toBeInTheDocument();
  });
  it('check if modal body gets displayed when old task is not present', () => {
    const mockNotifications = [{ userId: 'def123', _id: 'id456', taskId: 'task456' }];
    renderComponent(true, 'abc123', mockNotifications);
    expect(screen.queryByText('Black Bold = No Changes')).not.toBeInTheDocument();
  });
  it('check if task name and Task Name header gets displayed properly', () => {
    renderComponent(true, 'abc123', taskNotifications);
    expect(screen.getByText('Task Name')).toBeInTheDocument();
    expect(screen.getByText(`${taskNotifications[0].oldTask.taskName}`)).toBeInTheDocument();
  });
  it('check if priority and Assigned gets displayed properly', () => {
    renderComponent(true, 'abc123', taskNotifications);
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Assigned')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });
  it('check if status and Hours - Best-case gets displayed properly', () => {
    renderComponent(true, 'abc123', taskNotifications);
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();

    expect(screen.getByTestId('hours-best-value')).toHaveTextContent('10');
  });
  it('check if Hours - Worst-case and Hours - Most-case gets displayed properly', () => {
    renderComponent(true, 'abc123', taskNotifications);
    expect(screen.getByText('Hours - Worst-case')).toBeInTheDocument();

    expect(screen.getByTestId('hours-worst-value')).toHaveTextContent('13');
    expect(screen.getByText('Hours - Most-case')).toBeInTheDocument();
    expect(screen.getByTestId('hours-most-value')).toHaveTextContent('13');
  });
  it('check if estimated hours and Classification get displayed properly', () => {
    renderComponent(true, 'abc123', taskNotifications);
    expect(screen.getByText('Estimated Hours')).toBeInTheDocument();
    expect(screen.getByTestId('estimated-hours-value')).toHaveTextContent('11');
    expect(screen.getByText('Classification')).toBeInTheDocument();
    expect(screen.getByText('Example')).toBeInTheDocument();
  });
  it('check if Why this Task is Important and Design Intent get displayed properly', () => {
    renderComponent(true, 'abc123', taskNotifications);
    expect(screen.getByText('Why this Task is Important')).toBeInTheDocument();
    expect(screen.getByText('some reason')).toBeInTheDocument();
    expect(screen.getByText('Design Intent')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
  });
  it('check if Start Date and End Date does not get displayed when Start and End Date is set to null', () => {
    renderComponent(true, 'abc123', taskNotifications);

    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();

    expect(screen.queryByTestId('start-date-value')).not.toBeInTheDocument();
    expect(screen.queryByTestId('end-date-value')).not.toBeInTheDocument();
  });
  it('check if Start Date and End Date get displayed when Start and End Date is not set to null', () => {
    const newTaskNotifications = [
      {
        ...taskNotifications[0],
        oldTask: {
          ...taskNotifications[0].oldTask,
          startedDatetime: '2024-03-26T13:45:43.448+00:00',
          dueDatetime: '2024-03-31T13:45:43.448+00:00',
        },
      },
    ];

    renderComponent(true, 'abc123', newTaskNotifications);
    expect(screen.getByText('3/26/2024')).toBeInTheDocument();
    expect(screen.getByText('3/31/2024')).toBeInTheDocument();
  });
  it('check if EndState is displayed as expected', () => {
    renderComponent(true, 'abc123', taskNotifications);
    expect(screen.getByText('Endstate')).toBeInTheDocument();
    expect(screen.getByText('undefined')).toBeInTheDocument();
  });
  it('check if links, resources does not get displayed when the array size is 0', () => {
    renderComponent(true, 'abc123', taskNotifications);

    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Links')).toBeInTheDocument();

    expect(screen.queryByTestId('resources-value')).not.toBeInTheDocument();
    expect(screen.queryByTestId('links-value')).not.toBeInTheDocument();
  });
  it('check if links and resources get displayed as expected when links and resources arrays are set to entries more than 0', () => {
    const newResource = [
      {
        completedTask: true,
        _id: 'resource123',
        userID: 'abc123',
        name: 'resource 1',
      },
      {
        completedTask: false,
        _id: 'resource456',
        userID: 'abc123',
        name: 'resource 2',
      },
    ];
    const newLinks = ['http://www.link1.com', 'http://www/link2.com'];

    const newTaskNotifications = [
      {
        ...taskNotifications[0],
        oldTask: {
          ...taskNotifications[0].oldTask,
          resources: newResource,
          links: newLinks,
        },
      },
    ];
    renderComponent(true, 'abc123', newTaskNotifications);
    expect(screen.getByText(`${newLinks[0]} ${newLinks[1]}`)).toBeInTheDocument();
    expect(screen.getByText(`${newResource[0].name},${newResource[1].name}`)).toBeInTheDocument();
  });
});
