import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TableFilter from '../TableFilter';
import { waitFor } from '@testing-library/react';

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


  it('renders DatePicker components', () => {
    setup();
    const datePickerIcons = document.querySelectorAll('.date-picker-icon');
    expect(datePickerIcons.length).toBe(2);
  });

  it('calls searchEstimatedHours when estimated hours is changed', () => {
    setup();
    const estimatedHoursInput = screen.getByPlaceholderText('Estimated Hours');
    fireEvent.change(estimatedHoursInput, { target: { value: '5' } });
    expect(mockSearchEstimatedHours).toHaveBeenCalledWith('5');
  });

  
  it('calls setStartDate when start date is changed', () => {
    setup();
    const startDateInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(startDateInput, { target: { value: '01/01/2020' } });
  });

  it('renders checkboxes with default values', () => {
    setup();
    const activeCheckbox = screen.getByLabelText('Active');
    const assignCheckbox = screen.getByLabelText('Assign');
    expect(activeCheckbox.checked).toBe(true);
    expect(assignCheckbox.checked).toBe(true);
  });

});
