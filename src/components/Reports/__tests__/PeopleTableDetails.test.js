import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import PeopleTableDetails from '../PeopleTableDetails';

describe('PeopleTableDetails', () => {
  const taskData = [
    {
      _id: '1',
      taskName: 'Task 1',
      priority: 'High',
      status: 'In Progress',
      resources: [{ name: 'Resource 1' }, { name: 'Resource 2' }],
      active: 'Yes',
      assign: 'Yes',
      estimatedHours: '10',
      startDate: '2024-03-15',
      endDate: '2024-03-20',
      whyInfo: 'This task is important because...',
      intentInfo: 'The design intent is...',
      endstateInfo: 'The end state should be...',
    },
    // Add more sample tasks as needed
  ];

  it('renders the component without crashing', () => {
    render(<PeopleTableDetails taskData={taskData} />);
  });

  it('filters tasks correctly based on input', () => {
    const { getByLabelText, getAllByTestId } = render(<PeopleTableDetails taskData={taskData} />);

    // Enter values into filters
    fireEvent.change(getByLabelText('Search Task Name'), { target: { value: 'Task 1' } });
    fireEvent.change(getByLabelText('Search Priority'), { target: { value: 'High' } });
    fireEvent.change(getByLabelText('Search Status'), { target: { value: 'In Progress' } });
    fireEvent.change(getByLabelText('Search Resources'), { target: { value: 'Resource 1' } });
    fireEvent.change(getByLabelText('Search Active'), { target: { value: 'Yes' } });
    fireEvent.change(getByLabelText('Search Assign'), { target: { value: 'Yes' } });
    fireEvent.change(getByLabelText('Search Estimated Hours'), { target: { value: '10' } });

    // Get the filtered tasks
    const filteredTasks = getAllByTestId('filtered-task');

    // Assert that only one task is visible after filtering
    expect(filteredTasks.length).toBe(1);
    expect(filteredTasks[0].textContent).toContain('Task 1');
  });

  // Add more test cases as needed
});
