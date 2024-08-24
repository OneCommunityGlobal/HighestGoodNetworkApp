import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { PeopleTasksPieChart } from './PeopleTasksPieChart';

// Mock useSelector
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

describe('PeopleTasksPieChart', () => {
  beforeEach(() => {
    useSelector.mockClear();
  });

  const defaultSelectorData = {
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

  it('renders PieChart for tasks when showTasksPieChart is true', () => {
    useSelector.mockReturnValue(defaultSelectorData);

    render(<PeopleTasksPieChart darkMode={false} />);
    
    expect(screen.getByText(/Tasks With Completed Hours/i)).toBeInTheDocument();
  });

  it('renders without crashing when showTasksPieChart and showProjectsPieChart are false', () => {
    useSelector.mockReturnValue({
      ...defaultSelectorData,
      showTasksPieChart: false,
      showProjectsPieChart: false,
    });

    const { container } = render(<PeopleTasksPieChart darkMode={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders PieChart for projects when showProjectsPieChart is true', () => {
    useSelector.mockReturnValue({
      ...defaultSelectorData,
      showProjectsPieChart: true,
    });

    render(<PeopleTasksPieChart darkMode={false} />);
    
    expect(screen.getByText('Projects With Completed Hours')).toBeInTheDocument();
  });

  it('renders in dark mode when darkMode prop is true', () => {
    useSelector.mockReturnValue(defaultSelectorData);

    const { container } = render(<PeopleTasksPieChart darkMode={true} />);
    expect(container.firstChild).toHaveClass('text-light');
  });

  it('toggles "View all" button correctly', () => {
    useSelector.mockReturnValue(defaultSelectorData);

    render(<PeopleTasksPieChart darkMode={false} />);
    
    const viewAllButton = screen.getByText('View all');
    expect(viewAllButton).toBeInTheDocument();
    
    fireEvent.click(viewAllButton);
    
    expect(screen.getByText('Collapse')).toBeInTheDocument();
  });

  it('does not show "View all" button when showViewAllTasksButton is false', () => {
    useSelector.mockReturnValue({
      ...defaultSelectorData,
      showViewAllTasksButton: false,
    });

    render(<PeopleTasksPieChart darkMode={false} />);
    
    expect(screen.queryByText('View all')).not.toBeInTheDocument();
  });

  it('displays total hours as 0.00 when there is no task data', () => {
    useSelector.mockReturnValue({
      ...defaultSelectorData,
      tasksWithLoggedHoursById: {},
      displayedTasksWithLoggedHoursById: {},
    });

    render(<PeopleTasksPieChart darkMode={false} />);
    
    expect(screen.getByText('Total Hours : 0.00')).toBeInTheDocument();
  });

  it('displays correct legend information for tasks', () => {
    useSelector.mockReturnValue(defaultSelectorData);

    render(<PeopleTasksPieChart darkMode={false} />);
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('10 hours')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('20 hours')).toBeInTheDocument();
  });

  it('renders PieChart for tasks and projects based on their respective flags', () => {
    useSelector.mockReturnValue({
      ...defaultSelectorData,
      showTasksPieChart: true,
      showProjectsPieChart: true,
    });

    render(<PeopleTasksPieChart darkMode={false} />);
    
    expect(screen.getByText(/Tasks With Completed Hours/i)).toBeInTheDocument();
    expect(screen.getByText('Projects With Completed Hours')).toBeInTheDocument();
  });

});
