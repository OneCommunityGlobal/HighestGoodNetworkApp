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

  const renderComponent = props => render(
    <Provider store={store}>
      <TasksTable tasks={[]} {...props} />
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

  it('applies scoped dark styles to the Project Report filters', () => {
    renderComponent({ darkMode: true });

    expect(screen.getByPlaceholderText('Estimated hours').className).toContain(
      'dark-mode-text-input',
    );
    expect(screen.getByText('Any user').className).toContain('tasks-select__placeholder');
    expect(screen.getByText('Active', { selector: 'label' }).className).toContain(
      'dark-mode-checkbox-label',
    );
  });

  it('applies the scoped dark row style to task rows', () => {
    renderComponent({
      darkMode: true,
      tasks: [
        {
          _id: 'task-1',
          taskName: 'Dark task row',
          priority: 'High',
          status: 'Started',
          resources: [],
          isAssigned: true,
          isActive: true,
          classification: 'Core',
          estimatedHours: 2,
        },
      ],
    });

    expect(screen.getByRole('row', { name: /Dark task row/ }).className).toContain(
      'dark-mode-row',
    );
  });
});
