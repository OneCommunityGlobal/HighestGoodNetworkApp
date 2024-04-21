import { render, screen, fireEvent } from '@testing-library/react';
import PeopleTableDetails from '../PeopleTableDetails';

// Mock data for the Test cases
const taskData = [
  {
    _id: '1',
    taskName: 'Task 1',
    priority: 'High',
    status: 'Completed',
    resources: [[{ name: 'Resource 1', index: 1, profilepic: '' }]],
    active: 'Yes',
    assign: 'No',
    estimatedHours: '5h',
    startDate: '2022-01-01',
    endDate: '2022-01-10',
  },
  {
    _id: '2',
    taskName: 'Task 2',
    priority: 'Low',
    status: 'In Progress',
    resources: [
      [{ name: 'Resource 2', index: 2, profilepic: '' }],
      [{ name: 'Resource 3', index: 3, profilepic: '' }],
    ],
    active: 'Yes',
    assign: 'Yes',
    estimatedHours: '10h',
    startDate: '2022-02-01',
    endDate: '2022-02-10',
  },
  {
    _id: '3',
    taskName: 'Task 3',
    priority: 'Medium',
    status: 'Not Started',
    resources: [[{ name: 'Resource 4', index: 1, profilepic: '' }]],
    active: 'No',
    assign: 'Yes',
    estimatedHours: '8h',
    startDate: '2022-03-01',
    endDate: '2022-03-15',
  },
];
describe(' Unit Test case for PeopleTableDetails component', () => {
  it('Test 1 : Basic render without crashing', () => {
    render(<PeopleTableDetails taskData={taskData} />);
    expect(screen.getByTestId('eh'));
  });

  it('Test 2 : Verify if the table header renders as expected ', () => {
    render(<PeopleTableDetails taskData={taskData} />);
    expect(screen.getByTestId('task'));
    expect(screen.getByTestId('priority'));
    expect(screen.getByTestId('status'));
    expect(screen.getByTestId('resources'));
    expect(screen.getByTestId('active'));
    expect(screen.getByTestId('eh'));
    expect(screen.getByTestId('sd'));
    expect(screen.getByTestId('ed'));
  });

  it('Test 3 : Verify if the table row renders the mock data', () => {
    render(<PeopleTableDetails taskData={taskData} />);
    // Expect to see text from the first task
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();

    // Check the second task as well
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();

    // Check the third task as well
    expect(screen.getByText('Task 3')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Not Started')).toBeInTheDocument();
  });

  it('Test 4 : Verify if the filterTasks function gracefully handless missing attribute and doesnt throw any error  ', () => {
    const tasks = [
      {
        _id: '1',
        taskName: 'Project 1',
        // Missed priority attribute
        status: 'Completed',
        resources: [[{ name: 'Resource 1', index: 1, profilepic: '' }]],
        active: 'Yes',
        assign: 'No',
        estimatedHours: '5h',
        startDate: '2022-01-01',
        endDate: '2022-01-10',
      },
      {
        _id: '2',
        taskName: 'Project 2',
        priority: 'Low',
        // Missed status attribute
        resources: [
          [
            { name: 'Resource 2', index: 1, profilepic: '' },
            { name: 'Resource 3', index: 2, profilepic: '' },
          ],
        ],
        active: 'Yes',
        assign: 'Yes',
        estimatedHours: '10h',
        startDate: '2022-02-01',
        endDate: '2022-02-10',
      },
    ];
    render(<PeopleTableDetails taskData={tasks} />);
    const project1Text = screen.queryByText('Project 1');
    expect(project1Text).not.toBeInTheDocument();
    const project2Text = screen.queryByText('Project 2');
    expect(project2Text).not.toBeInTheDocument();
  });

  it('Test 5 : Verify if the  renderFilteredTask doesnt render any button if the no of resources is less than 2  ', () => {
    const tasks = [
      {
        _id: '1',
        taskName: 'Project 1',
        priority: 'High',
        status: 'Completed',
        resources: [[{ name: 'Resource 1', index: 1, profilepic: '' }]],
        active: 'Yes',
        assign: 'No',
        estimatedHours: '5h',
        startDate: '2022-01-01',
        endDate: '2022-01-10',
      },
    ];
    render(<PeopleTableDetails taskData={tasks} />);

    expect(screen.getByText('Project 1')).toBeInTheDocument();
    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });

  it('Test 6 : Verify if the  renderFilteredTask  render  button if the no of resources is greater than 2  ', () => {
    const tasks = [
      {
        _id: '1',
        taskName: 'Project 2',
        priority: 'High',
        status: 'Completed',
        resources: [
          [
            { name: 'Resource 2', index: 2, profilepic: '' },
            { name: 'Resource 3', index: 3, profilepic: '' },
            { name: 'Resource 1', index: 1, profilepic: '' },
          ],
        ],
        active: 'Yes',
        assign: 'No',
        estimatedHours: '5h',
        startDate: '2022-01-01',
        endDate: '2022-01-10',
      },
    ];
    render(<PeopleTableDetails taskData={tasks} />);

    expect(screen.getByText('Project 2')).toBeInTheDocument();
    const button = screen.queryByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('Test 7 : Verify the button in the resource cell renders as expected when clicked ', () => {
    const tasks = [
      {
        _id: '1',
        taskName: 'Project 2',
        priority: 'High',
        status: 'Completed',
        resources: [
          [
            { name: 'Resource 2', index: 2, profilepic: '' },
            { name: 'Resource 3', index: 3, profilepic: '' },
            { name: 'Resource 1', index: 1, profilepic: '' },
          ],
        ],
        active: 'Yes',
        assign: 'No',
        estimatedHours: '5h',
        startDate: '2022-01-01',
        endDate: '2022-01-10',
      },
    ];

    render(<PeopleTableDetails taskData={tasks} />);
    const toggleButton = screen.queryByRole('button');

    const extraDiv = toggleButton.parentElement.querySelector('.extra');
    expect(extraDiv).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(extraDiv.style.display).toBe('table-cell');
    fireEvent.click(toggleButton);

    expect(extraDiv.style.display).toBe('none');
  });

  it('Test 8 : Verify when there are more than 2 resources the remaining number of resources is disaplyed ', () => {
    const tasks = [
      {
        _id: '1',
        taskName: 'Project 2',
        priority: 'High',
        status: 'Completed',
        resources: [
          [
            { name: 'Resource 2', index: 2, profilepic: '' },
            { name: 'Resource 3', index: 3, profilepic: '' },
            { name: 'Resource 1', index: 1, profilepic: '' },
            { name: 'Resource 4', index: 4, profilepic: '' },
          ],
        ],
        active: 'Yes',
        assign: 'No',
        estimatedHours: '5h',
        startDate: '2022-01-01',
        endDate: '2022-01-10',
      },
    ];

    render(<PeopleTableDetails taskData={tasks} />);
    expect(screen.getByText('2+')).toBeInTheDocument();

    // const extraResources = screen.getByText('2+');

    // expect(extraResources).toBeInTheDocument();
  });
});
