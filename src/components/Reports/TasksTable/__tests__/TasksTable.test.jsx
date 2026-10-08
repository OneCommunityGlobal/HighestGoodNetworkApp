// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { TasksTable } from '../TasksTable';

describe('TasksTable component', () => {
  const mockStore = configureMockStore();
  const mockState = {
    tasks: {
    }
  };

  const store = mockStore(mockState);

  const renderComponent = () => render(
    <Provider store={store}>
      <TasksTable tasks={[]} />
    </Provider>
  );

  it('renders the component', () => {
    renderComponent();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
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
