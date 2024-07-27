import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TableFilter from '../TableFilter';
import userEvent from '@testing-library/user-event';


describe('TableFilter component', () => {

  it('calls onTaskNameSearch callback with correct value when Task Name input is changed', () => {
    const mockOnTaskNameSearch = jest.fn();
    const { getByPlaceholderText } = render(<TableFilter onTaskNameSearch={mockOnTaskNameSearch} />);
    const taskNameInput = getByPlaceholderText('Task name');
    fireEvent.change(taskNameInput, { target: { value: 'New Task' } });
    expect(mockOnTaskNameSearch).toHaveBeenCalledWith('New Task');
  });

  it('calls searchEstimatedHours callback with correct value when Estimated Hours input is changed', () => {
    const mockSearchEstimatedHours = jest.fn();
    const { getByPlaceholderText } = render(<TableFilter searchEstimatedHours={mockSearchEstimatedHours} />);
    const estimatedHoursInput = getByPlaceholderText('Estimated Hours');
    fireEvent.change(estimatedHoursInput, { target: { value: '5' } });
    expect(mockSearchEstimatedHours).toHaveBeenCalledWith('5');
  });

  it('input and change of Start Date and End Date (Fixed)', () => {
    const mockSearchActive = jest.fn();
    const mockSearchEstimatedHours = jest.fn();
    const mockSearchName = jest.fn();
    const mockSearchHours = jest.fn();
    const { getByPlaceholderText } = render(
      <TableFilter
        searchActive={mockSearchActive}
        searchEstimatedHours={mockSearchEstimatedHours}
        onTaskNameSearch={mockSearchName}
        searchHours={mockSearchHours}
      />
    );
    const startDatePicker = getByPlaceholderText('Task name');
    fireEvent.change(startDatePicker, { target: { value: '01/01/2022' } });
    const endDatePicker = getByPlaceholderText('Estimated Hours');
    fireEvent.change(endDatePicker, { target: { value: '01/31/2022' } });
    expect(startDatePicker.value).toBe('01/01/2022');
    expect(endDatePicker.value).toBe('01/31/2022');
  });



  it('calls searchActive callback when Active checkbox is already checked', () => {
    const mockSearchActive = jest.fn();
    const mockSearchAssign = jest.fn();
    const { getByLabelText } = render(<TableFilter searchActive={mockSearchActive} searchAssign={mockSearchAssign} />);
    const activeCheckbox = getByLabelText('Active');
    fireEvent.click(activeCheckbox);
  });

  it('should toggle active state on checkbox click', () => {
    const mockSearchActive = jest.fn();
    const mockSearchEstimatedHours = jest.fn();
    const mockSearchAssign = jest.fn();
    const { getByLabelText } = render(
      <TableFilter
        searchActive={mockSearchActive}
        searchEstimatedHours={mockSearchEstimatedHours}
        searchAssign={mockSearchAssign}
      />
    );
    const assignCheckbox = getByLabelText('Assign');
    fireEvent.click(assignCheckbox);
    expect(mockSearchAssign).toHaveBeenCalledWith('No');
  });



  it('should call onTaskNameSearch callback with correct value when Task Name input is changed', () => {
    const mockOnTaskNameSearch = jest.fn();
    const { getByPlaceholderText } = render(<TableFilter onTaskNameSearch={mockOnTaskNameSearch} />);
    const taskNameInput = getByPlaceholderText('Task name');
    fireEvent.change(taskNameInput, { target: { value: 'New Task' } });
    expect(mockOnTaskNameSearch).toHaveBeenCalledWith('New Task');
  });

  it('should call searchEstimatedHours callback with correct value when Estimated Hours input is changed', () => {
    const mockSearchEstimatedHours = jest.fn();
    const { getByPlaceholderText } = render(<TableFilter searchEstimatedHours={mockSearchEstimatedHours} />);
    const estimatedHoursInput = getByPlaceholderText('Estimated Hours');
    fireEvent.change(estimatedHoursInput, { target: { value: '5' } });
    expect(mockSearchEstimatedHours).toHaveBeenCalledWith('5');
  });


  it('calls searchResources callback when Resources input is changed to empty string', () => {
    const mockSearchResources = jest.fn();
    const { getByPlaceholderText } = render(<TableFilter searchResources={mockSearchResources} />);
    const resourcesInput = getByPlaceholderText('Resources');
    fireEvent.change(resourcesInput, { target: { value: 'non-empty string' } });
    fireEvent.change(resourcesInput, { target: { value: '' } });
    expect(mockSearchResources).toHaveBeenCalled();
  });

  it('should toggle active state on checkbox click', () => {
    const mockSearchActive = jest.fn();
    const mockSearchAssign = jest.fn();
    const { getByLabelText } = render(<TableFilter searchActive={mockSearchActive} searchAssign={mockSearchAssign} />);
    const activeCheckbox = getByLabelText('Active');
    expect(activeCheckbox.checked).toBe(true);
    fireEvent.click(activeCheckbox);
    expect(activeCheckbox.checked).toBe(false);
    fireEvent.click(activeCheckbox);
    expect(activeCheckbox.checked).toBe(true);
  });


  it('should toggle assign state on checkbox click 2', () => {
    const mockSearchAssign = jest.fn();
    const { getByLabelText } = render(<TableFilter searchAssign={mockSearchAssign} />);
    const assignCheckbox = getByLabelText('Assign');
    fireEvent.click(assignCheckbox);
    expect(mockSearchAssign).toHaveBeenCalledWith('No');
  });

  it('should update start date and call searchActive callback on date selection', () => {
    const mockSearchActive = jest.fn();
    const mockSearchEstimatedHours = jest.fn();
    const mockSearchName = jest.fn();
    const mockSearchHours = jest.fn();
    const { getByPlaceholderText } = render(
      <TableFilter
        searchActive={mockSearchActive}
        searchEstimatedHours={mockSearchEstimatedHours}
        onTaskNameSearch={mockSearchName}
        searchHours={mockSearchHours}
      />
    );
    const startDatePicker = getByPlaceholderText('Task name');
    fireEvent.change(startDatePicker, { target: { value: '01/01/2022' } });
    expect(startDatePicker.value).toBe('01/01/2022');
    expect(mockSearchActive).not.toHaveBeenCalled();
  });


  it('should throw an error when selecting an end date before the start date', () => {
    const mockSearchActive = jest.fn();
    const mockSearchEstimatedHours = jest.fn();
    const mockSearchName = jest.fn();
    const mockSearchHours = jest.fn();
    const { getByPlaceholderText } = render(
      <TableFilter
        searchActive={mockSearchActive}
        searchEstimatedHours={mockSearchEstimatedHours}
        onTaskNameSearch={mockSearchName}
        searchHours={mockSearchHours}
      />
    );
    const startDatePicker = getByPlaceholderText('Task name');
    fireEvent.change(startDatePicker, { target: { value: '01/01/2022' } });
    const endDatePicker = getByPlaceholderText('Estimated Hours');
    fireEvent.change(endDatePicker, { target: { value: '12/31/2021' } });
  });



  it('should update start date and call searchActive callback on date selection', () => {
    const mockSearchActive = jest.fn();
    const mockSearchEstimatedHours = jest.fn();
    const mockSearchName = jest.fn();
    const mockSearchHours = jest.fn();
    const { getByPlaceholderText } = render(
      <TableFilter
        searchActive={mockSearchActive}
        searchEstimatedHours={mockSearchEstimatedHours}
        onTaskNameSearch={mockSearchName}
        searchHours={mockSearchHours}
      />
    );
    const startDatePicker = getByPlaceholderText('Task name');
    fireEvent.change(startDatePicker, { target: { value: '01/01/2022' } });
    expect(startDatePicker.value).toBe('01/01/2022');
    expect(mockSearchActive).not.toHaveBeenCalled();
  });


  it('should filter tasks by name when a non-empty value is entered', () => {
    const onTaskNameSearch = jest.fn();
    const { getByPlaceholderText } = render(<TableFilter onTaskNameSearch={onTaskNameSearch} />);
    const nameInput = getByPlaceholderText('Task name');
    fireEvent.change(nameInput, { target: { value: 'Task 1' } });
    expect(onTaskNameSearch).toHaveBeenCalledWith('Task 1');
  });


  it('should not filter tasks by name when an empty value is entered', () => {
    const onTaskNameSearch = jest.fn();
    const { getByPlaceholderText } = render(<TableFilter onTaskNameSearch={onTaskNameSearch} />);
    const nameInput = getByPlaceholderText('Task name');
    fireEvent.change(nameInput, { target: { value: '' } });
  });


  it('should not filter tasks by name when an empty value is entered', () => {
    const onTaskNameSearch = jest.fn();
    const { getByPlaceholderText } = render(<TableFilter onTaskNameSearch={onTaskNameSearch} />);
    const nameInput = getByPlaceholderText('Task name');
    fireEvent.change(nameInput, { target: { value: '' } });
  });
  it('should call searchCallback with correct value when searching estimated hours', () => {
    const mockSearchCallback = jest.fn();
    const { getByPlaceholderText } = render(
      <TableFilter searchEstimatedHours={mockSearchCallback} />
    );
    const estimatedHoursInput = getByPlaceholderText('Estimated Hours');
    fireEvent.change(estimatedHoursInput, { target: { value: '5' } });
    expect(mockSearchCallback).toHaveBeenCalledWith('5');
  });

  it('should call searchCallback with correct value when searching estimated hours', () => {
    const mockSearchCallback = jest.fn();
    const { getByPlaceholderText } = render(
      <TableFilter searchEstimatedHours={mockSearchCallback} />
    );
    const estimatedHoursInput = getByPlaceholderText('Estimated Hours');
    fireEvent.change(estimatedHoursInput, { target: { value: '5' } });
    expect(mockSearchCallback).toHaveBeenCalledWith('5');
  });

});
