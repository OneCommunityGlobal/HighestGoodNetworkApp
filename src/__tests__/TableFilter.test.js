import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TableFilter from '../components/Reports/TableFilter/TableFilter';

describe('TableFilter Component', () => {
  const mockOnTaskNameSearch = jest.fn();
  const mockSearchPriority = jest.fn();
  const mockSearchStatus = jest.fn();
  const mockSearchResources = jest.fn();
  const mockSearchActive = jest.fn();
  const mockSearchAssign = jest.fn();
  const mockSearchEstimatedHours = jest.fn();

  const setup = () => {
    render(
      <TableFilter
        onTaskNameSearch={mockOnTaskNameSearch}
        searchPriority={mockSearchPriority}
        searchStatus={mockSearchStatus}
        searchResources={mockSearchResources}
        searchActive={mockSearchActive}
        searchAssign={mockSearchAssign}
        searchEstimatedHours={mockSearchEstimatedHours}
        name=""
        estimatedHours=""
        resources=""
        status=""
        priority=""
      />
    );
  };

  it('renders text inputs correctly', () => {
    setup();
    const taskNameInput = screen.getByPlaceholderText('Task name');
    const estimatedHoursInput = screen.getByPlaceholderText('Estimated Hours');
    const resourcesInput = screen.getByPlaceholderText('Resources');

    expect(taskNameInput).toBeInTheDocument();
    expect(estimatedHoursInput).toBeInTheDocument();
    expect(resourcesInput).toBeInTheDocument();
  });

  it('calls onTaskNameSearch when task name is changed', () => {
    setup();
    const taskNameInput = screen.getByPlaceholderText('Task name');

    // Simulate a change event that sets the value of the input
    fireEvent.change(taskNameInput, { target: { value: 'Task 1' } });

    expect(mockOnTaskNameSearch).toHaveBeenCalledWith('Task 1');
  });

  // Similarly, write tests for other text inputs and dropdowns

  it('renders DatePicker components', () => {
    setup();
    const datePickerIcons = document.querySelectorAll('.date-picker-icon');
    expect(datePickerIcons.length).toBe(2);
  });

});
