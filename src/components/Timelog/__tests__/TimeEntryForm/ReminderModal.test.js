import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ReminderModal from '../../TimeEntryForm/ReminderModal';
import { themeMock } from '__tests__/mockStates';

describe('ReminderModal Component', () => {
  const mockSetVisible = jest.fn();
  const mockCancelChange = jest.fn();

  const initialState = {
    theme: themeMock,
  };
  const mockStore = configureStore([]);
  const store = mockStore(initialState);

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
      <Provider store={store}>
        <ReminderModal {...baseProps} />
      </Provider>
    );
    expect(getByText('Reminder')).toBeInTheDocument();
    expect(getByText('Test Reminder')).toBeInTheDocument();
  });

  it('should not render the modal when visible is false', () => {
    const { queryByText } = render(
      <Provider store={store}>
        <ReminderModal {...{ ...baseProps, visible: false }} />
      </Provider>
    );
    expect(queryByText('Reminder')).not.toBeInTheDocument();
  });

  it('should render Continue button and trigger setVisible on click', () => {
    const { getByText } = render(
      <Provider store={store}>
        <ReminderModal {...baseProps} />
      </Provider>
    );
    const continueButton = getByText('Continue');
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
    const { getByText, rerender } = render(
      <Provider store={store}>
        <ReminderModal {...propsWithEdit} />
      </Provider>
    );
    expect(getByText('Cancel')).toBeInTheDocument();

    // Case where Cancel button should not be rendered
    rerender(
      <Provider store={store}>
        <ReminderModal {...{ ...propsWithEdit, inputs: { hours: 1, minutes: 30 } }} />
      </Provider>
    );
    expect(() => getByText('Cancel')).toThrow();
  });

  it('should call cancelChange when Cancel button is clicked', () => {
    const propsWithEdit = {
      ...baseProps,
      edit: true,
      data: { hours: 1, minutes: 30 },
      inputs: { hours: 2, minutes: 30 },
    };
    const { getByText } = render(
      <Provider store={store}>
        <ReminderModal {...propsWithEdit} />
      </Provider>
    );
    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockCancelChange).toHaveBeenCalled();
  });
});
