import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TeamMemberTask from 'components/TeamMemberTasks/TeamMemberTask';
import { authMock, rolesMock, userProfileMock } from './mockStates.js';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

// sample props used for testing purpose. You can change the props according to your test.
// currently used admin props to conduct the test

const props = {
  name: 'Dev Admin',
  personId: '5edf141c78f1380017b829a6',
  role: 'Administrator',
  tasks: [
    {
      deadlineCount: 1,
      dueDatetime: '2023-12-08T08:00:00.000Z',
      estimatedHours: 20,
      hoursBest: 20,
      hoursLogged: 17.55,
      hoursMost: 20,
      hoursWorst: 20,
      isAssigned: true,
      num: '1',
      projectId: 'project1234',
      resources: [],
      status: 'Started',
      taskName: 'Task 1',
      taskNotifications: [],
      wbsId: 'wbs1234',
      __v: 0,
      _id: 'task11234',
    },
  ],
  totaltangibletime_hrs: 10.5,
  totaltime_hrs: 0,
  weeklycommittedHours: 10,
};

const mockStore = configureStore([thunk]);

const store = mockStore({
  auth: authMock,
  userProfile: userProfileMock,
  role: rolesMock.role,
});

const handleOpenTaskNotificationModal = jest.fn();
const handleMarkAsDoneModal = jest.fn();
const handleRemoveFromTaskModal = jest.fn();
const handleTaskModalOption = jest.fn();
const updateTaskStatus = jest.fn();

const renderComponent = mockProps => {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <table>
          <tbody>
            <TeamMemberTask
              user={mockProps}
              handleMarkAsDoneModal={handleMarkAsDoneModal}
              handleRemoveFromTaskModal={handleRemoveFromTaskModal}
              handleOpenTaskNotificationModal={handleOpenTaskNotificationModal}
              handleTaskModalOption={handleTaskModalOption}
              userRole={mockProps.role}
              userId={mockProps.personId}
              updateTaskStatus={updateTaskStatus}
            />
          </tbody>
        </table>
      </MemoryRouter>
    </Provider>,
  );
};

describe('Team Member Task Component', () => {
  it('status circle if committed time is fulfilled and red otherwise', () => {
    renderComponent(props);

    // verify if the icon changes to red or green based on whether the user has completed their weekly committed hours

    const icon = screen.getByTestId('icon');
    if (props.totaltangibletime_hrs >= props.weeklycommittedHours) {
      expect(icon).toHaveStyle('color: green');
    } else {
      expect(icon).toHaveStyle('color: red');
    }
  });
  it('team member name and link should be displayed properly', () => {
    renderComponent(props);

    // verify if team member name and its associated link is working properly

    const linkElement = screen.getAllByText(props.name);
    expect(linkElement[0].textContent).toBe(props.name);

    const href = linkElement[0].getAttribute('href');
    expect(href).toBe(`/userprofile/${props.personId}`);
  });
  it('weeklycommittedHours, LoggedHours, remainingHours,  showing up beside the task is right', () => {
    renderComponent(props);

    // weeklycommitted Hours, totalTangibleHrs are available in the sample props. Calculated remaining time based on the two values.
    // verify if weeklycommittedHours, totalTangibleHrs, totalHoursRemaining are correct

    const weeklycommittedHours = parseFloat(
      screen.getByText(props.weeklycommittedHours).textContent,
    );

    const totalTangibleHrs = parseFloat(screen.getByText(props.totaltangibletime_hrs).textContent);

    let totalHoursRemaining = 0;

    if (props.tasks) {
      totalHoursRemaining = props.tasks.reduce((total, task) => {
        task.hoursLogged = task.hoursLogged || 0;
        task.estimatedHours = task.estimatedHours || 0;

        if (task.status !== 'Complete' && task.isAssigned !== 'false') {
          return total + (task.estimatedHours - task.hoursLogged);
        }
        return total;
      }, 0);
    }
    const tangibleHrs = props.totaltangibletime_hrs ? props.totaltangibletime_hrs.toFixed(1) : 0;
    const remainHours = totalHoursRemaining ? totalHoursRemaining.toFixed(1) : 0;
    const remainingHrs = parseFloat(screen.getByText(remainHours).textContent);
    expect(weeklycommittedHours).toBe(props.weeklycommittedHours);
    expect(totalTangibleHrs).toBe(parseFloat(tangibleHrs));
    expect(remainingHrs).toBe(parseFloat(remainHours));
  });
  it('task names should be displayed properly and icons associated with each task should function properly', () => {
    // modified the props for testing different permissions for icon display
    // added a second task with taskNotifications to check task name, link associated with task name, deadline count, icons: bell, tick, X mark

    // Note: changed role to volunteer to check which icons display for that role.

    const modifiedProps = { ...props, role: 'Volunteer' };
    const newTaskToAdd = {
      deadlineCount: undefined,
      dueDatetime: '2023-12-30T08:00:00.000Z',
      estimatedHours: 20,
      hoursBest: 20,
      hoursLogged: 12,
      hoursMost: 20,
      hoursWorst: 20,
      isAssigned: true,
      num: '2',
      projectId: 'project5678',
      resources: [{}],
      status: 'Started',
      taskName: 'Task 2',
      taskNotifications: [
        {
          dateCreated: '2023-10-28T21:30:37.640Z',
          isAcknowleged: 0,
          taskId: 'task21234',
          userId: '5edf141c78f1380017b829a6',
          __v: 0,
          _id: 'id1234',
        },
      ],
      wbsId: 'wbs5678',
      __v: 0,
      _id: 'task21234',
    };
    modifiedProps.tasks.push(newTaskToAdd);
    renderComponent(modifiedProps);

    modifiedProps.tasks.forEach(task => {
      // this is for checking task name
      const taskName = task.taskName;
      const taskElement = screen.getByText(task.num + ' ' + taskName);
      expect(taskElement.textContent).toContain(task.num + ' ' + taskName);

      // this is for checking link associated with the name
      const linkElement = screen.getByTestId(taskName);
      const href = linkElement.getAttribute('href');

      if (task.projectId) {
        expect(href).toBe(`/wbs/tasks/${task._id}`);
      } else {
        expect(href).toBe(`/`);
      }

      // check bell icon
      const iconElement = screen.queryByTestId(`task-info-icon-${taskName}`);
      if (iconElement != null) {
        fireEvent.click(iconElement);
        const taskNotificationId = task.taskNotifications.filter(taskNotification => {
          if (taskNotification.userId === props.personId) {
            return taskNotification;
          }
        });
        expect(handleOpenTaskNotificationModal).toHaveBeenCalledWith(
          modifiedProps.personId,
          task,
          taskNotificationId,
        );
      } else {
        expect(iconElement).toBeNull();
      }
      // check tick mark
      const tickElement = screen.queryByTestId(`tick-${taskName}`);
      if (tickElement != null) {
        fireEvent.click(tickElement);
        expect(handleMarkAsDoneModal).toHaveBeenCalledWith(props.personId, task);
        expect(handleTaskModalOption).toHaveBeenCalledWith('Checkmark');
      } else {
        expect(tickElement).toBeNull();
      }

      // check X mark
      const XmarkElement = screen.queryByTestId(`Xmark-${task.taskName}`);
      if (XmarkElement != null) {
        fireEvent.click(XmarkElement);
        expect(handleRemoveFromTaskModal).toHaveBeenCalledWith(props.personId, task);
        expect(handleTaskModalOption).toHaveBeenCalledWith('XMark');
      } else {
        expect(XmarkElement).toBeNull();
      }

      // check deadline count
      const deadlineElement = screen.queryByTestId(`deadline-${task.taskName}`);
      if (deadlineElement != null) {
        if (task.deadlineCount == undefined) {
          expect(parseInt(deadlineElement.textContent)).toBe(0);
        } else {
          expect(parseInt(deadlineElement.textContent)).toBe(task.deadlineCount);
        }
      } else {
        expect(deadlineElement).toBeNull();
      }
    });
  });
  it('progress bar should show the right time for each task', () => {
    // verify the logged time and estimated time for each task

    const modifiedProps = { ...props };
    const newTaskToAdd = {
      deadlineCount: undefined,
      dueDatetime: '2023-12-30T08:00:00.000Z',
      estimatedHours: 20,
      hoursBest: 20,
      hoursLogged: 12,
      hoursMost: 20,
      hoursWorst: 20,
      isAssigned: true,
      num: '2',
      projectId: 'project5678',
      resources: [{}],
      status: 'Started',
      taskName: 'Task 2',
      taskNotifications: [
        {
          dateCreated: '2023-10-28T21:30:37.640Z',
          isAcknowleged: 0,
          taskId: 'task21234',
          userId: '5edf141c78f1380017b829a6',
          __v: 0,
          _id: 'id1234',
        },
      ],
      wbsId: 'wbs5678',
      __v: 0,
      _id: 'task21234',
    };
    modifiedProps.tasks.push(newTaskToAdd);
    renderComponent(modifiedProps);

    modifiedProps.tasks.forEach(task => {
      const timeElement = screen.getAllByTestId(`times-${task.taskName}`);
      expect(timeElement[0].textContent).toBe(
        `${task.hoursLogged}\n                            of\n                          ${task.estimatedHours}`,
      );
    });
  });
});
