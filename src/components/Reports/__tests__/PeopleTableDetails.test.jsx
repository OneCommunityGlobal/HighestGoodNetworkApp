import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import PeopleTableDetails, {
  CenteredValueCell,
  TaskResourceCell,
  YesNoCell,
} from '../PeopleTableDetails';

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
    expect(screen.getAllByText('Task 1')[0]).toBeInTheDocument();;
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

   expect(screen.getAllByText('Project 2')[0]).toBeInTheDocument();
    const toggleButton = screen.getByText('1+');
    expect(toggleButton).toBeInTheDocument();
  });

  it('toggles resource visibility when button is clicked', () => {
    const taskId = taskFixtureThreeNamedResources[0]._id;
    render(<PeopleTableDetails taskData={taskFixtureThreeNamedResources} />);

    const toggleButton = screen.getByRole('button', { name: /^\d+\+$/ });
    expect(toggleButton).toBeInTheDocument();
    expect(screen.getByTestId(`extra-resources-${taskId}`)).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByTestId(`extra-resources-${taskId}`)).toHaveStyle({
      display: 'table-cell',
    });

    fireEvent.click(screen.getByRole('button', { name: /^\d+\+$/ }));
    expect(screen.getByTestId(`extra-resources-${taskId}`)).toHaveStyle({ display: 'none' });
  });

  it('Test 8 : Verify remaining resource count displayed', () => {
    render(<PeopleTableDetails taskData={[getMockTask('1', 'P2', 4)]} />);
    expect(screen.getByText('2+')).toBeInTheDocument();
  });
});

describe('TaskResourceCell', () => {
  const baseProps = { expandedTasks: {}, toggleMoreResources: () => {} };

  it('renders nothing extra when the task has 2 or fewer resources', () => {
    render(<TaskResourceCell row={{ original: getMockTask('1', 'P1', 2) }} {...baseProps} />);
    expect(screen.queryByRole('button', { name: /^\d+\+$/ })).not.toBeInTheDocument();
  });

  it('renders a toggle button when the task has more than 2 resources', () => {
    render(
      <TaskResourceCell
        row={{ original: createTaskWithThreeNamedResources() }}
        {...baseProps}
      />,
    );
    expect(screen.getByText('1+')).toBeInTheDocument();
  });

  it('shows the extra-resources block when the task is in expandedTasks', () => {
    const task = createTaskWithThreeNamedResources();
    render(
      <TaskResourceCell
        row={{ original: task }}
        expandedTasks={{ [task._id]: true }}
        toggleMoreResources={() => {}}
      />,
    );
    const extra = screen.getByTestId(`extra-resources-${task._id}`);
    expect(extra).toHaveStyle({ display: 'table-cell' });
  });

  it('invokes toggleMoreResources with the task id when the toggle is clicked', () => {
    const task = createTaskWithThreeNamedResources();
    const toggleMoreResources = vi.fn();
    render(
      <TaskResourceCell
        row={{ original: task }}
        expandedTasks={{}}
        toggleMoreResources={toggleMoreResources}
      />,
    );
    fireEvent.click(screen.getByText('1+'));
    expect(toggleMoreResources).toHaveBeenCalledWith(task._id);
  });
});

describe('YesNoCell', () => {
  it('renders a check mark when value is "Yes"', () => {
    render(<YesNoCell value="Yes" />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders a cross mark when value is anything other than "Yes"', () => {
    const { container } = render(<YesNoCell value="No" />);
    expect(container.textContent).toBe('❌');
  });
});

describe('CenteredValueCell', () => {
  it('renders the supplied value inside a centered div', () => {
    render(<CenteredValueCell value="2022-01-01" />);
    expect(screen.getByText('2022-01-01')).toHaveStyle({ textAlign: 'center' });
  });
});
