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
describe('PeopleTableDetails component', () => {
  it('renders without crashing', () => {
    render(<PeopleTableDetails taskData={taskData} />);
    expect(screen.getByTestId('eh'));
  });

  it('renders all table headers correctly', () => {
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

  it('displays all task data in table rows', () => {
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

  it('handles missing task attributes gracefully', () => {
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

  it('does not show resource toggle button when there are less than 2 resources', () => {
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
    const toggleButton = screen.queryByText('+');
    expect(toggleButton).not.toBeInTheDocument();
  });

  it('shows resource toggle button when there are more than 2 resources', () => {
    const tasks = [
      {
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
      },
    ];
    render(<PeopleTableDetails taskData={tasks} />);

    expect(screen.getByText('Project 2')).toBeInTheDocument();
    const toggleButton = screen.getByText('1+');
    expect(toggleButton).toBeInTheDocument();
  });

  it('toggles resource visibility when button is clicked', () => {
    const tasks = [
      {
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
      },
    ];

    render(<PeopleTableDetails taskData={tasks} />);

    const allButtons = screen.getAllByRole('button');
    const toggleButton = allButtons.find(button =>
      button.classList.contains('resourceMoreToggle')
    );
    expect(toggleButton).toBeInTheDocument();

    // eslint-disable-next-line testing-library/no-node-access
    const extraDiv = toggleButton.parentElement.querySelector('.extra');
    expect(extraDiv).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(extraDiv.style.display).toBe('table-cell');

    fireEvent.click(toggleButton);
    expect(extraDiv.style.display).toBe('none');
  });

  it('displays correct number of remaining resources', () => {
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
  });
});
