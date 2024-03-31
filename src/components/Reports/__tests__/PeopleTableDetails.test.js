import { render, fireEvent } from '@testing-library/react';
import PeopleTableDetails from '../PeopleTableDetails';

describe('PeopleTableDetails component', () => {
  const taskData = [
    {
      _id: '1',
      taskName: 'Task 1',
      priority: 'High',
      status: 'Completed',
      resources: [{ name: 'Resource 1' }, { name: 'Resource 2' }],
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
      resources: [{ name: 'Resource 3' }, { name: 'Resource 4' }, { name: 'Resource 5' }],
      active: 'Yes',
      assign: 'Yes',
      estimatedHours: '10h',
      startDate: '2022-02-01',
      endDate: '2022-02-10',
    },
  ];

  it('should render filtered tasks correctly', () => {
    const { getByText } = render(<PeopleTableDetails taskData={taskData} />);
    expect(getByText('Task 1')).toBeInTheDocument();
    expect(getByText('High')).toBeInTheDocument();
    expect(getByText('Completed')).toBeInTheDocument();
  });

  it('should render task details modal when task is clicked', () => {
    const { getByText } = render(<PeopleTableDetails taskData={taskData} />);
    fireEvent.click(getByText('Task 1'));
    expect(getByText('Why This Task is important')).toBeInTheDocument();
  });

  it('should reset filters when resetFilters function is called', () => {
    const { getByLabelText } = render(<PeopleTableDetails taskData={taskData} />);
    fireEvent.change(getByLabelText('Search by Task Name'), { target: { value: 'Task 1' } });
    expect(getByLabelText('Search by Task Name').value).toBe('Task 1');
    fireEvent.click(getByLabelText('Reset Filters'));
    expect(getByLabelText('Search by Task Name').value).toBe('');
  });

  it('should toggle display of more resources when "More" button is clicked', () => {
    const { getByText, getByTestId } = render(<PeopleTableDetails taskData={taskData} />);
    fireEvent.click(getByTestId('1'));
    fireEvent.click(getByText('More'));
    expect(getByTestId('1')).toHaveStyle('display: table-cell');
    fireEvent.click(getByText('More'));
    expect(getByTestId('1')).toHaveStyle('display: none');
  });

  it('should filter tasks based on search criteria', () => {
    const { getByLabelText, queryByText } = render(<PeopleTableDetails taskData={taskData} />);
    fireEvent.change(getByLabelText('Search by Task Name'), { target: { value: 'Task 2' } });
    expect(queryByText('Task 1')).not.toBeInTheDocument();
    expect(getByLabelText('Search by Task Name').value).toBe('Task 2');
  });
});
