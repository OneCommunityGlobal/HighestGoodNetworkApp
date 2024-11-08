// ReminderModal.test.js
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ReminderModal from '../../TimeEntryForm/ReminderModal'; // Adjust the path as necessary

describe('ReminderModal Component', () => {
  const mockSetVisible = jest.fn();
  const mockCancelChange = jest.fn();

  const baseProps = {
    visible: true,
    setVisible: mockSetVisible,
    reminder: { remind: 'Test Reminder' },
    edit: false,
    inputs: {},
    cancelChange: mockCancelChange,
  };

  it('should render the modal when visible is true', () => {
    const { getByText } = render(
      <ReminderModal
        visible={baseProps.visible}
        setVisible={baseProps.setVisible}
        reminder={baseProps.reminder}
        edit={baseProps.edit}
        inputs={baseProps.inputs}
        cancelChange={baseProps.cancelChange}
      />
    );
    expect(getByText('Reminder')).toBeInTheDocument();
    expect(getByText('Test Reminder')).toBeInTheDocument();
  });

  it('should not render the modal when visible is false', () => {
    const { queryByText } = render(
      <ReminderModal
        visible={false}
        setVisible={baseProps.setVisible}
        reminder={baseProps.reminder}
        edit={baseProps.edit}
        inputs={baseProps.inputs}
        cancelChange={baseProps.cancelChange}
      />
    );
    expect(queryByText('Reminder')).not.toBeInTheDocument();
  });

  it('should render Continue button and trigger setVisible on click', () => {
    const { getByText } = render(
      <ReminderModal
        visible={baseProps.visible}
        setVisible={baseProps.setVisible}
        reminder={baseProps.reminder}
        edit={baseProps.edit}
        inputs={baseProps.inputs}
        cancelChange={baseProps.cancelChange}
      />
    );
    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);
    expect(mockSetVisible).toHaveBeenCalledWith(false);
  });

  it('should conditionally render the Cancel button based on edit and data comparison', () => {
    // Case where Cancel button should be rendered
    const propsWithEdit = {
      visible: baseProps.visible,
      setVisible: baseProps.setVisible,
      reminder: baseProps.reminder,
      edit: true,
      inputs: { hours: 2, minutes: 30 },
      cancelChange: mockCancelChange,
      data: { hours: 1, minutes: 30 },
    };
    const { getByText, rerender } = render(
      <ReminderModal
        visible={propsWithEdit.visible}
        setVisible={propsWithEdit.setVisible}
        reminder={propsWithEdit.reminder}
        edit={propsWithEdit.edit}
        inputs={propsWithEdit.inputs}
        cancelChange={propsWithEdit.cancelChange}
        data={propsWithEdit.data}
      />
    );
    expect(getByText('Cancel')).toBeInTheDocument();

    // Case where Cancel button should not be rendered
    rerender(
      <ReminderModal
        visible={propsWithEdit.visible}
        setVisible={propsWithEdit.setVisible}
        reminder={propsWithEdit.reminder}
        edit={propsWithEdit.edit}
        inputs={{ hours: 1, minutes: 30 }}
        cancelChange={propsWithEdit.cancelChange}
        data={propsWithEdit.data}
      />
    );
    expect(() => getByText('Cancel')).toThrow();
  });

  it('should call cancelChange when Cancel button is clicked', () => {
    const propsWithEdit = {
      visible: baseProps.visible,
      setVisible: baseProps.setVisible,
      reminder: baseProps.reminder,
      edit: true,
      inputs: { hours: 2, minutes: 30 },
      cancelChange: mockCancelChange,
      data: { hours: 1, minutes: 30 },
    };
    const { getByText } = render(
      <ReminderModal
        visible={propsWithEdit.visible}
        setVisible={propsWithEdit.setVisible}
        reminder={propsWithEdit.reminder}
        edit={propsWithEdit.edit}
        inputs={propsWithEdit.inputs}
        cancelChange={propsWithEdit.cancelChange}
        data={propsWithEdit.data}
      />
    );
    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockCancelChange).toHaveBeenCalled();
  });
});
