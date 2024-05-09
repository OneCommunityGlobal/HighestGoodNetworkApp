import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import TaskCompletedModal from '../components/TaskCompletedModal';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
  },
}));

describe('TaskCompletedModal Component', () => {
  const mockCloseFunction = jest.fn();
  const mockUpdateTask = jest.fn();
  const mockProps = {
    isOpen: true,
    setClickedToShowModal: jest.fn(),
    setCurrentUserId: jest.fn(),
    popupClose: mockCloseFunction,
    updateTask: mockUpdateTask,
    task: { _id: '1', resources: [] },
    userId: 'user123',
    taskModalOption: 'Checkmark', // or 'Remove'
  };

  const initialState = {
    theme: themeMock
  };
  const mockStore = configureStore([]);
  const store = mockStore(initialState);

  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <TaskCompletedModal {...mockProps} />
      </Provider>
    );
  });

  it('closes the modal on button click', () => {
    render(
      <Provider store={store}>
        <TaskCompletedModal {...mockProps} />
      </Provider>
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockCloseFunction).toHaveBeenCalled();
  });

  it('handles Checkmark option correctly', () => {
    render(
      <Provider store={store}>
        <TaskCompletedModal {...mockProps} />
      </Provider>
    );
    const markAsDoneButton = screen.getByRole('button', { name: 'Mark as Done' });
    expect(markAsDoneButton.textContent).toBe('Mark as Done');
    fireEvent.click(markAsDoneButton);
    expect(mockUpdateTask).toHaveBeenCalled();
  });
});
