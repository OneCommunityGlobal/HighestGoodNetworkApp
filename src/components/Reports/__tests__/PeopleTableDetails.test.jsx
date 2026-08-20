import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PeopleTableDetails from '../PeopleTableDetails';

// Factory function to eliminate SonarCloud duplication
const getMockTask = (id, taskName, resourceCount) => ({
  _id: id,
  taskName: taskName,
  priority: 'High',
  status: 'Completed',
  resources: [Array(resourceCount).fill({ name: 'Res', index: 1, profilePic: '' })],
  active: 'Yes',
  assign: 'No',
  estimatedHours: '5h',
  startDate: '2022-01-01',
  endDate: '2022-01-10',
});

/** Single task with three named resources in the shape PeopleTableDetails expects */
const createTaskWithThreeNamedResources = () => ({
  _id: '1',
  taskName: 'Project 2',
  priority: 'High',
  status: 'Completed',
  resources: [
    [
      { name: 'Resource 2', index: 2, profilePic: '' },
      { name: 'Resource 3', index: 3, profilePic: '' },
      { name: 'Resource 1', index: 1, profilePic: '' },
    ],
  ],
  active: 'Yes',
  assign: 'No',
  estimatedHours: '5h',
  startDate: '2022-01-01',
  endDate: '2022-01-10',
});

const taskData = [
  getMockTask('1', 'Task 1', 1),
  getMockTask('2', 'Task 2', 2),
  getMockTask('3', 'Task 3', 1),
];

const taskFixtureThreeNamedResources = [createTaskWithThreeNamedResources()];

describe('Unit Test case for PeopleTableDetails component', () => {
  it('Test 1 : Basic render', () => {
    render(<PeopleTableDetails taskData={taskData} />);
    expect(screen.getByTestId('eh')).toBeInTheDocument();
  });

  it('Test 2 : Verify table headers', () => {
    render(<PeopleTableDetails taskData={taskData} />);
    ['task', 'priority', 'status', 'resources', 'active', 'eh', 'sd', 'ed'].forEach(id => {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    });
  });

  it('Test 3 : Verify row data renders', () => {
    render(<PeopleTableDetails taskData={taskData} />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('displays a task with no resources and no start date', () => {
    const taskWithoutResourcesOrStartDate = {
      ...getMockTask('4', 'Unassigned task', 0),
      resources: [[]],
      startDate: 'null',
    };

    render(<PeopleTableDetails taskData={[taskWithoutResourcesOrStartDate]} />);

    expect(screen.getByText('Unassigned task')).toBeInTheDocument();
  });

  it('Test 5 : Verify no toggle button if resources < 2', () => {
    render(<PeopleTableDetails taskData={[getMockTask('1', 'P1', 1)]} />);
    expect(screen.queryByRole('button', { name: /^\d+\+$/ })).not.toBeInTheDocument();
  });

  it('Test 6 : Verify button renders if resources > 2', () => {
    render(<PeopleTableDetails taskData={[getMockTask('1', 'P2', 3)]} />);
    expect(screen.getByRole('button', { name: /^\d+\+$/ })).toBeInTheDocument();
  });

  it('shows resource toggle button when there are more than 2 resources', () => {
    render(<PeopleTableDetails taskData={taskFixtureThreeNamedResources} />);

    expect(screen.getByText('Project 2')).toBeInTheDocument();
    const toggleButton = screen.getByText('1+');
    expect(toggleButton).toBeInTheDocument();
  });

  it('toggles resource visibility when button is clicked', () => {
    render(<PeopleTableDetails taskData={taskFixtureThreeNamedResources} />);

    const allButtons = screen.getAllByRole('button');
    const toggleButton = allButtons.find(button => button.textContent.includes('+'));
    expect(toggleButton).toBeInTheDocument();

    // eslint-disable-next-line testing-library/no-node-access
    const extraDiv = document.getElementById(taskFixtureThreeNamedResources[0]._id);
    expect(extraDiv).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(extraDiv.style.display).toBe('table-cell');

    fireEvent.click(toggleButton);
    expect(extraDiv).not.toBeVisible();
  });

  it('Test 8 : Verify remaining resource count displayed', () => {
    render(<PeopleTableDetails taskData={[getMockTask('1', 'P2', 4)]} />);
    expect(screen.getByText('2+')).toBeInTheDocument();
  });
});
