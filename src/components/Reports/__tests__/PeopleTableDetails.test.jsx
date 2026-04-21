import { render, screen, fireEvent, within } from '@testing-library/react';
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

const taskData = [
  getMockTask('1', 'Task 1', 1),
  getMockTask('2', 'Task 2', 2),
  getMockTask('3', 'Task 3', 1),
];

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

  it('Test 5 : Verify no toggle button if resources < 2', () => {
    render(<PeopleTableDetails taskData={[getMockTask('1', 'P1', 1)]} />);
    expect(screen.queryByRole('button', { name: /^\d+\+$/ })).not.toBeInTheDocument();
  });

  it('Test 6 : Verify button renders if resources > 2', () => {
    render(<PeopleTableDetails taskData={[getMockTask('1', 'P2', 3)]} />);
    expect(screen.getByRole('button', { name: /^\d+\+$/ })).toBeInTheDocument();
  });

  it('Test 7 : Verify toggle interaction using Testing Library methods', () => {
    render(<PeopleTableDetails taskData={[getMockTask('1', 'P2', 3)]} />);
    const row = screen.getByText('P2').closest('.people-table-row');
    const toggleButton = within(row).getByRole('button', { name: /^\d+\+$/ });
    const extraDiv = within(row).getByTestId('extra-resources');
    
    // Explicitly hide for test consistency
    extraDiv.style.display = 'none'; 
    expect(extraDiv).not.toBeVisible();

    fireEvent.click(toggleButton);
    expect(extraDiv).toBeVisible();
    
    fireEvent.click(toggleButton);
    expect(extraDiv).not.toBeVisible();
  });

  it('Test 8 : Verify remaining resource count displayed', () => {
    render(<PeopleTableDetails taskData={[getMockTask('1', 'P2', 4)]} />);
    expect(screen.getByText('2+')).toBeInTheDocument();
  });
});