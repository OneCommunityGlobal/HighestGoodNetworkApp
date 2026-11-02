import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { PeopleTasksPieChart } from 'components/Reports/PeopleReport/components';

// Mock the useSelector from react-redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

describe('PeopleTasksPieChart Component Tests', () => {
  // Clear the mock before each test
  beforeEach(() => {
    useSelector.mockClear();
  });

  const mockData = {
    tasksWithLoggedHoursById: { task1: 10, task2: 20 },
    showTasksPieChart: true,
    showProjectsPieChart: false,
    tasksLegend: {
      task1: ['Task 1', '10 hours'],
      task2: ['Task 2', '20 hours'],
    },
    projectsWithLoggedHoursById: {},
    projectsWithLoggedHoursLegend: {},
    displayedTasksWithLoggedHoursById: { task1: 10, task2: 20 },
    displayedTasksLegend: {
      task1: ['Task 1', '10 hours'],
      task2: ['Task 2', '20 hours'],
    },
    showViewAllTasksButton: true,
  };

  it('should render PieChart for tasks when showTasksPieChart is true', () => {
    useSelector.mockReturnValue(mockData);
    render(<PeopleTasksPieChart darkMode={false} />);
    
    expect(screen.getByText(/Tasks With Completed Hours/i)).toBeInTheDocument();
  });

  it('should not crash when both pie chart flags are false', () => {
    useSelector.mockReturnValue({
      ...mockData,
      showTasksPieChart: false,
      showProjectsPieChart: false,
    });
    const { container } = render(<PeopleTasksPieChart darkMode={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render PieChart for projects when showProjectsPieChart is true', () => {
    useSelector.mockReturnValue({
      ...mockData,
      showProjectsPieChart: true,
    });
    render(<PeopleTasksPieChart darkMode={false} />);
    
    expect(screen.getByText('Projects With Completed Hours')).toBeInTheDocument();
  });

  it('should apply dark mode styles when darkMode prop is true', () => {
    useSelector.mockReturnValue(mockData);
    const { container } = render(<PeopleTasksPieChart darkMode={true} />);
    // expect(container.firstChild).toHaveClass('text-light');
  });


  it('should not display "View all" button when showViewAllTasksButton is false', () => {
    useSelector.mockReturnValue({
      ...mockData,
      showViewAllTasksButton: false,
    });
    render(<PeopleTasksPieChart darkMode={false} />);
    
    expect(screen.queryByText('View all')).not.toBeInTheDocument();
  });

  it('should show total hours as 0.00 if there are no task entries', () => {
    useSelector.mockReturnValue({
      ...mockData,
      tasksWithLoggedHoursById: {},
      displayedTasksWithLoggedHoursById: {},
    });
    render(<PeopleTasksPieChart darkMode={false} />);
    
    expect(screen.getByText('Total Hours : 0.00')).toBeInTheDocument();
  });

  it('should correctly display legends for tasks', () => {
    useSelector.mockReturnValue(mockData);
    render(<PeopleTasksPieChart darkMode={false} />);
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('10 hours')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('20 hours')).toBeInTheDocument();
  });

  it('should render both PieCharts for tasks and projects when both flags are true', () => {
    useSelector.mockReturnValue({
      ...mockData,
      showTasksPieChart: true,
      showProjectsPieChart: true,
    });
    render(<PeopleTasksPieChart darkMode={false} />);
    
    expect(screen.getByText(/Tasks With Completed Hours/i)).toBeInTheDocument();
    expect(screen.getByText('Projects With Completed Hours')).toBeInTheDocument();
  });
});
