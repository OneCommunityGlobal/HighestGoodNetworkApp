import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ReminderModal from '../../TimeEntryForm/ReminderModal'; // Adjust the path as necessary

describe('ReminderModal Component', () => {
  const mockSetVisible = vi.fn();
  const mockCancelChange = vi.fn();

  const baseProps = {
    visible: true,
    setVisible: mockSetVisible,
    reminder: { remind: 'Test Reminder' },
    edit: false,
    inputs: {},
    cancelChange: mockCancelChange,
  };

  it('should render the modal when visible is true', () => {
    render(
      <ReminderModal
        visible={baseProps.visible}
        setVisible={baseProps.setVisible}
        reminder={baseProps.reminder}
        edit={baseProps.edit}
        inputs={baseProps.inputs}
        cancelChange={baseProps.cancelChange}
      />
    );
    expect(screen.getByText('Reminder')).toBeInTheDocument();
    expect(screen.getByText('Test Reminder')).toBeInTheDocument();
  });

  it('should not render the modal when visible is false', () => {
    render(
      <ReminderModal
        visible={false}
        setVisible={baseProps.setVisible}
        reminder={baseProps.reminder}
        edit={baseProps.edit}
        inputs={baseProps.inputs}
        cancelChange={baseProps.cancelChange}
      />
    );
    expect(screen.queryByText('Reminder')).not.toBeInTheDocument();
  });

  it('should render Continue button and trigger setVisible on click', () => {
    render(
      <ReminderModal
        visible={baseProps.visible}
        setVisible={baseProps.setVisible}
        reminder={baseProps.reminder}
        edit={baseProps.edit}
        inputs={baseProps.inputs}
        cancelChange={baseProps.cancelChange}
      />
    );
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);
    expect(mockSetVisible).toHaveBeenCalledWith(false);
  });

  it('should conditionally render the Cancel button based on edit and data comparison', () => {
    // Case where Cancel button should be rendered
    const propsWithEdit = {
      ...baseProps,
      edit: true,
      data: { hours: 1, minutes: 30 },
      inputs: { hours: 2, minutes: 30 },
    };

    const { rerender } = render(
      <ReminderModal
        visible={propsWithEdit.visible}
        setVisible={propsWithEdit.setVisible}
        reminder={propsWithEdit.reminder}
        edit={propsWithEdit.edit}
        inputs={propsWithEdit.inputs}
        data={propsWithEdit.data}
        cancelChange={propsWithEdit.cancelChange}
      />
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();

    rerender(
      <ReminderModal
        visible={propsWithEdit.visible}
        setVisible={propsWithEdit.setVisible}
        reminder={propsWithEdit.reminder}
        edit={propsWithEdit.edit}
        inputs={{ hours: 1, minutes: 30 }}
        data={propsWithEdit.data}
        cancelChange={propsWithEdit.cancelChange}
      />
    );
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('should call cancelChange when Cancel button is clicked', () => {
    const propsWithEdit = {
      ...baseProps,
      edit: true,
      data: { hours: 1, minutes: 30 },
      inputs: { hours: 2, minutes: 30 },
    };

    render(
      <ReminderModal
        visible={propsWithEdit.visible}
        setVisible={propsWithEdit.setVisible}
        reminder={propsWithEdit.reminder}
        edit={propsWithEdit.edit}
        inputs={propsWithEdit.inputs}
        data={propsWithEdit.data}
        cancelChange={propsWithEdit.cancelChange}
      />
    );
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockCancelChange).toHaveBeenCalled();
  });
});