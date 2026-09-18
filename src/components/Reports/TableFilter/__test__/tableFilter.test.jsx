// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
// eslint-disable-next-line no-unused-vars
import '@testing-library/jest-dom/extend-expect';
// eslint-disable-next-line no-unused-vars
import userEvent from '@testing-library/user-event';
import TableFilter from '../TableFilter';

describe('TableFilter component', () => {
  it('calls onTaskNameSearch callback with correct value when Task Name input is changed', () => {
    const mockOnTaskNameSearch = vi.fn();
    render(<TableFilter onTaskNameSearch={mockOnTaskNameSearch} />);
    const taskNameInput = screen.getByPlaceholderText('Task name');
    fireEvent.change(taskNameInput, { target: { value: 'New Task' } });
    expect(mockOnTaskNameSearch).toHaveBeenCalledWith('New Task');
  });

  it('calls searchEstimatedHours callback with correct value when Estimated Hours input is changed', () => {
    const mockSearchEstimatedHours = vi.fn();
    render(<TableFilter searchEstimatedHours={mockSearchEstimatedHours} />);
    const estimatedHoursInput = screen.getByPlaceholderText('Estimated Hours');
    fireEvent.change(estimatedHoursInput, { target: { value: '5' } });
    expect(mockSearchEstimatedHours).toHaveBeenCalledWith('5');
  });

  it('input and change of Start Date and End Date (Fixed)', () => {
    const mockSearchActive = vi.fn();
    const mockSearchEstimatedHours = vi.fn();
    const mockSearchName = vi.fn();
    const mockSearchHours = vi.fn();
    render(
      <TableFilter
        searchActive={mockSearchActive}
        searchEstimatedHours={mockSearchEstimatedHours}
        onTaskNameSearch={mockSearchName}
        searchHours={mockSearchHours}
      />,
    );
    const startDatePicker = screen.getByPlaceholderText('Task name');
    fireEvent.change(startDatePicker, { target: { value: '01/01/2022' } });
    const endDatePicker = screen.getByPlaceholderText('Estimated Hours');
    fireEvent.change(endDatePicker, { target: { value: '01/31/2022' } });
    expect(startDatePicker.value).toBe('01/01/2022');
    expect(endDatePicker.value).toBe('01/31/2022');
  });

  it('calls searchActive callback when Active checkbox is already checked', () => {
    const mockSearchActive = vi.fn();
    const mockSearchAssign = vi.fn();
    render(<TableFilter searchActive={mockSearchActive} searchAssign={mockSearchAssign} />);
    const activeCheckbox = screen.getByLabelText('Active');
    fireEvent.click(activeCheckbox);
  });

  it('should toggle active state on checkbox click', () => {
    const mockSearchActive = vi.fn();
    const mockSearchEstimatedHours = vi.fn();
    const mockSearchAssign = vi.fn();
    render(
      <TableFilter
        searchActive={mockSearchActive}
        searchEstimatedHours={mockSearchEstimatedHours}
        searchAssign={mockSearchAssign}
      />,
    );
    const assignCheckbox = screen.getByLabelText('Assign');
    fireEvent.click(assignCheckbox);
    expect(mockSearchAssign).toHaveBeenCalledWith('No');
  });

  it('should call onTaskNameSearch callback with correct value when Task Name input is changed', () => {
    const mockOnTaskNameSearch = vi.fn();
    render(<TableFilter onTaskNameSearch={mockOnTaskNameSearch} />);
    const taskNameInput = screen.getByPlaceholderText('Task name');
    fireEvent.change(taskNameInput, { target: { value: 'New Task' } });
    expect(mockOnTaskNameSearch).toHaveBeenCalledWith('New Task');
  });

  it('should call searchEstimatedHours callback with correct value when Estimated Hours input is changed', () => {
    const mockSearchEstimatedHours = vi.fn();
    render(<TableFilter searchEstimatedHours={mockSearchEstimatedHours} />);
    const estimatedHoursInput = screen.getByPlaceholderText('Estimated Hours');
    fireEvent.change(estimatedHoursInput, { target: { value: '5' } });
    expect(mockSearchEstimatedHours).toHaveBeenCalledWith('5');
  });

  it('calls searchResources callback when Resources input is changed to empty string', () => {
    const mockSearchResources = vi.fn();
    render(<TableFilter searchResources={mockSearchResources} />);
    const resourcesInput = screen.getByPlaceholderText('Resources');
    fireEvent.change(resourcesInput, { target: { value: 'non-empty string' } });
    fireEvent.change(resourcesInput, { target: { value: '' } });
    expect(mockSearchResources).toHaveBeenCalled();
  });

  it('should toggle active state on checkbox click', () => {
    const mockSearchActive = vi.fn();
    const mockSearchAssign = vi.fn();
    render(<TableFilter searchActive={mockSearchActive} searchAssign={mockSearchAssign} />);
    const activeCheckbox = screen.getByLabelText('Active');
    expect(activeCheckbox.checked).toBe(true);
    fireEvent.click(activeCheckbox);
    expect(activeCheckbox.checked).toBe(false);
    fireEvent.click(activeCheckbox);
    expect(activeCheckbox.checked).toBe(true);
  });

  it('should toggle assign state on checkbox click 2', () => {
    const mockSearchAssign = vi.fn();
    render(<TableFilter searchAssign={mockSearchAssign} />);
    const assignCheckbox = screen.getByLabelText('Assign');
    fireEvent.click(assignCheckbox);
    expect(mockSearchAssign).toHaveBeenCalledWith('No');
  });

  it('should update start date and call searchActive callback on date selection', () => {
    const mockSearchActive = vi.fn();
    const mockSearchEstimatedHours = vi.fn();
    const mockSearchName = vi.fn();
    const mockSearchHours = vi.fn();
    render(
      <TableFilter
        searchActive={mockSearchActive}
        searchEstimatedHours={mockSearchEstimatedHours}
        onTaskNameSearch={mockSearchName}
        searchHours={mockSearchHours}
      />,
    );
    const startDatePicker = screen.getByPlaceholderText('Task name');
    fireEvent.change(startDatePicker, { target: { value: '01/01/2022' } });
    expect(startDatePicker.value).toBe('01/01/2022');
    expect(mockSearchActive).not.toHaveBeenCalled();
  });

  it('should throw an error when selecting an end date before the start date', () => {
    const mockSearchActive = vi.fn();
    const mockSearchEstimatedHours = vi.fn();
    const mockSearchName = vi.fn();
    const mockSearchHours = vi.fn();
    render(
      <TableFilter
        searchActive={mockSearchActive}
        searchEstimatedHours={mockSearchEstimatedHours}
        onTaskNameSearch={mockSearchName}
        searchHours={mockSearchHours}
      />,
    );
    const startDatePicker = screen.getByPlaceholderText('Task name');
    fireEvent.change(startDatePicker, { target: { value: '01/01/2022' } });
    const endDatePicker = screen.getByPlaceholderText('Estimated Hours');
    fireEvent.change(endDatePicker, { target: { value: '12/31/2021' } });
  });

  it('should update start date and call searchActive callback on date selection', () => {
    const mockSearchActive = vi.fn();
    const mockSearchEstimatedHours = vi.fn();
    const mockSearchName = vi.fn();
    const mockSearchHours = vi.fn();
    render(
      <TableFilter
        searchActive={mockSearchActive}
        searchEstimatedHours={mockSearchEstimatedHours}
        onTaskNameSearch={mockSearchName}
        searchHours={mockSearchHours}
      />,
    );
    const startDatePicker = screen.getByPlaceholderText('Task name');
    fireEvent.change(startDatePicker, { target: { value: '01/01/2022' } });
    expect(startDatePicker.value).toBe('01/01/2022');
    expect(mockSearchActive).not.toHaveBeenCalled();
  });

  it('should filter tasks by name when a non-empty value is entered', () => {
    const onTaskNameSearch = vi.fn();
    render(<TableFilter onTaskNameSearch={onTaskNameSearch} />);
    const nameInput = screen.getByPlaceholderText('Task name');
    fireEvent.change(nameInput, { target: { value: 'Task 1' } });
    expect(onTaskNameSearch).toHaveBeenCalledWith('Task 1');
  });

  it('should not filter tasks by name when an empty value is entered', () => {
    const onTaskNameSearch = vi.fn();
    render(<TableFilter onTaskNameSearch={onTaskNameSearch} />);
    const nameInput = screen.getByPlaceholderText('Task name');
    fireEvent.change(nameInput, { target: { value: '' } });
  });

  it('should not filter tasks by name when an empty value is entered', () => {
    const onTaskNameSearch = vi.fn();
    render(<TableFilter onTaskNameSearch={onTaskNameSearch} />);
    const nameInput = screen.getByPlaceholderText('Task name');
    fireEvent.change(nameInput, { target: { value: '' } });
  });
  it('should call searchCallback with correct value when searching estimated hours', () => {
    const mockSearchCallback = vi.fn();
    render(<TableFilter searchEstimatedHours={mockSearchCallback} />);
    const estimatedHoursInput = screen.getByPlaceholderText('Estimated Hours');
    fireEvent.change(estimatedHoursInput, { target: { value: '5' } });
    expect(mockSearchCallback).toHaveBeenCalledWith('5');
  });

  it('should call searchCallback with correct value when searching estimated hours', () => {
    const mockSearchCallback = vi.fn();
    render(<TableFilter searchEstimatedHours={mockSearchCallback} />);
    const estimatedHoursInput = screen.getByPlaceholderText('Estimated Hours');
    fireEvent.change(estimatedHoursInput, { target: { value: '5' } });
    expect(mockSearchCallback).toHaveBeenCalledWith('5');
  });
});
