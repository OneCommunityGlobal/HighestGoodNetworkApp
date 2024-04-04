import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { TaskDifferenceModal } from '../TaskDifferenceModal';

const onApproveMock = jest.fn();
const toggleMock = jest.fn();
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
    <TaskDifferenceModal
      taskNotifications={taskNotificationsMock}
      task={task}
      onApprove={onApproveMock}
      userId={userId}
      isOpen={isOpen}
      toggle={toggleMock}
      loggedInUserId={loggedInUserId}
    />,
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
    expect(screen.queryByText('Task Info Changes')).toBeInTheDocument();
  });
  it('check if modal is not open when isOpen is set to false', () => {
    renderComponent(false, 'abc123', taskNotifications);
    expect(screen.queryByText('Task Info Changes')).not.toBeInTheDocument();
  });
  it('check if modal body does get displayed when task notification user id is same as user id', () => {
    renderComponent(true, 'abc123', taskNotifications);
    expect(screen.queryByText('Black Bold = No Changes')).toBeInTheDocument();
  });
  it('check if modal body does not get displayed when task notification user id is not same as user id', () => {
    renderComponent(true, 'ghi123', taskNotifications);
    expect(screen.queryByText('Black Bold = No Changes')).not.toBeInTheDocument();
  });
  it('check if modal body gets displayed when old task is not present', () => {
    const mockNotifications = [{ userId: 'def123', _id: 'id456', taskId: 'task456' }];
    renderComponent(true, 'abc123', mockNotifications);
    expect(screen.queryByText('Black Bold = No Changes')).not.toBeInTheDocument();
  });
  it('check if task name and Task Name header gets displayed properly', () => {
    renderComponent(true, 'abc123', taskNotifications);
    expect(screen.queryByText('Task Name')).toBeInTheDocument();
    expect(screen.queryByText(`${taskNotifications[0].oldTask.taskName}`)).toBeInTheDocument();
  });
  it('check if priority and Assigned gets displayed properly', () => {
    renderComponent(true, 'abc123', taskNotifications);
    expect(screen.queryByText('Priority')).toBeInTheDocument();
    expect(screen.queryByText('Primary')).toBeInTheDocument();
    expect(screen.queryByText('Assigned')).toBeInTheDocument();
    expect(screen.queryByText('Yes')).toBeInTheDocument();
  });
  it('check if status and Hours - Best-case gets displayed properly', () => {
    renderComponent(true, 'abc123', taskNotifications);
    expect(screen.queryByText('Status')).toBeInTheDocument();
    expect(screen.queryByText('Complete')).toBeInTheDocument();

    const hoursBestLabel = screen.getByText('Hours - Best-case');

    expect(screen.queryByText('Hours - Best-case')).toBeInTheDocument();
    const hoursBestValueElement = hoursBestLabel.nextElementSibling;
    const spanElement = hoursBestValueElement.querySelector('span');
    expect(spanElement.textContent).toBe('10');
  });
  it('check if Hours - Worst-case and Hours - Most-case gets displayed properly', () => {
    renderComponent(true, 'abc123', taskNotifications);
    expect(screen.queryByText('Hours - Worst-case')).toBeInTheDocument();

    const hoursWorstLabel = screen.getByText('Hours - Worst-case');
    const hoursWorstValueElement = hoursWorstLabel.nextElementSibling;
    const spanElement = hoursWorstValueElement.querySelector('span');
    expect(spanElement.textContent).toBe('13');

    expect(screen.queryByText('Hours - Most-case')).toBeInTheDocument();
    const hoursMostLabel = screen.getByText('Hours - Most-case');
    const hoursMostValueElement = hoursMostLabel.nextElementSibling;
    const hoursMostSpanElement = hoursMostValueElement.querySelector('span');
    expect(hoursMostSpanElement.textContent).toBe('13');
  });
  it('check if estimated hours and Classification get displayed properly', () => {
    renderComponent(true, 'abc123', taskNotifications);
    expect(screen.queryByText('Estimated Hours')).toBeInTheDocument();
    const estimatedHoursLabel = screen.getByText('Estimated Hours');
    const estimatedHoursValueElement = estimatedHoursLabel.nextElementSibling;
    const estimatedHoursSpanElement = estimatedHoursValueElement.querySelector('span');
    expect(estimatedHoursSpanElement.textContent).toBe('11');

    expect(screen.queryByText('Classification')).toBeInTheDocument();
    expect(screen.queryByText('Example')).toBeInTheDocument();
  });
  it('check if Why this Task is Important and Design Intent get displayed properly', () => {
    renderComponent(true, 'abc123', taskNotifications);
    expect(screen.queryByText('Why this Task is Important')).toBeInTheDocument();
    expect(screen.queryByText('some reason')).toBeInTheDocument();
    expect(screen.queryByText('Design Intent')).toBeInTheDocument();
    expect(screen.queryByText('Food')).toBeInTheDocument();
  });
  it('check if Start Date and End Date does not get displayed when Start and End Date is set to null', () => {
    renderComponent(true, 'abc123', taskNotifications);
    const startDateLabel = screen.getByText('Start Date');
    const startDateElement = startDateLabel.nextElementSibling;
    const startSpanElement = startDateElement.querySelector('span');
    expect(startSpanElement).toHaveStyle('color: black; font-weight: bold;');

    const endDateLabel = screen.getByText('End Date');
    const endDateElement = endDateLabel.nextElementSibling;
    const endSpanElement = endDateElement.querySelector('span');
    expect(endSpanElement).toHaveStyle('color: black; font-weight: bold;');
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
    const resourceLabel = screen.getByText('Resources');
    const resourceElement = resourceLabel.nextElementSibling;
    const resourceSpanElement = resourceElement.querySelector('span');
    expect(resourceSpanElement).toHaveStyle('color: black; font-weight: bold;');

    const linksLabel = screen.getByText('Links');
    const linksElement = linksLabel.nextElementSibling;
    const linksSpanElement = linksElement.querySelector('span');
    expect(linksSpanElement).toHaveStyle('color: black; font-weight: bold;');
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
