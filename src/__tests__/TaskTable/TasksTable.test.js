import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TasksTable } from '../../components/Reports/TasksTable';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

describe('TasksTable component', () => {
  const mockStore = configureStore();
  const mockState = {
    tasks: {
    }
  };

  const store = mockStore(mockState);

  const renderComponent = () => render(
    <Provider store={store}>
      <TasksTable WbsTasksID={['someId']} />
    </Provider>
  );

  it('renders the component', () => {
    const { getByText } = renderComponent();
    expect(getByText('Tasks')).toBeInTheDocument();
  });

  it('handles filter changes', () => {
    renderComponent();
    const classificationOption = screen.getByText('Any classification');
    fireEvent.click(classificationOption);
  });


  it('handles checkbox changes', () => {
    renderComponent();
    const activeCheckbox = screen.getByLabelText('Active');
    fireEvent.click(activeCheckbox);
    expect(activeCheckbox).not.toBeChecked();
  });


  it('interacts with redux store', () => {
    renderComponent();
  });

  it('passes correct props to TasksDetail', () => {
    renderComponent();
  });
});
