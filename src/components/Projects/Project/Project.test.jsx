import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import Project from './Project';
import thunk from 'redux-thunk'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares);

const renderProject = (props, haspermission) => {
  const initialState = {
    role: {
      roles: []
    },
    auth: {
      user: {
        role: 'Owner', 
        permissions: {
          frontPermissions: [],
        },
      },
    },
  };
  const store = mockStore(initialState);

  return render(
    <Provider store={store}>
      {/* Wrap your component with BrowserRouter */}
      <BrowserRouter>
        <Project {...props} hasPermission={haspermission} />
      </BrowserRouter>
    </Provider>
  );
}
  

describe('Project Component', () => {

  it('renders correctly with props', () => {

    const sampleProject = {
      projectId: 1,
      index: 0,
      name: 'Sample Project',
      category: 'Unspecified',
      active: true,
      onUpdateProjectName: false,
      onClickActive: false,
      onClickDelete: false,
      hasPermission: true,
    };

    const { getByDisplayValue, getByTestId } = renderProject(sampleProject);

   
    //Using getByDisplayValue to find the input element with the value "Sample Project"
    expect(getByDisplayValue('Sample Project')).toBeInTheDocument();
    //Verify that the select element is rendered
    const selectElement = getByTestId('projects__category--input');
    expect(selectElement).toBeInTheDocument();
    expect(getByTestId('project-active')).toBeInTheDocument();
    expect(getByTestId('delete-button')).toBeInTheDocument();

    // Verify the default value
    expect(getByDisplayValue('Unspecified')).toBeInTheDocument();
  });

  it('updates project name on input change', () => {
    const sampleProject = {
      projectId: 1,
      index: 0,
      name: 'Sample Project',
      category: 'Unspecified',
      active: true,
      onUpdateProjectName: false,
      onClickActive: false,
      onClickDelete: false,
      hasPermission: true,
    };

    const { getByDisplayValue } = renderProject(sampleProject);

    // Find the input element and change its value
    const inputElement = getByDisplayValue('Sample Project');
    fireEvent.change(inputElement, { target: { value: 'New Project Name' } });

    // Check if the input value has been updated
    expect(getByDisplayValue('New Project Name')).toBeInTheDocument();
  });

  it('toggles project active status on button click', () => {
    const sampleProject = {
      projectId: 1,
      index: 0,
      name: 'Sample Project',
      category: 'Unspecified',
      active: true,
      onUpdateProjectName: jest.fn(),
      onClickActive: jest.fn(),
      onClickDelete: jest.fn(),
      hasPermission: true,
    };

    const { getByTestId } = renderProject(sampleProject);

    // Find the active status button and click it
    const activeButton = getByTestId('project-active');
    fireEvent.click(activeButton);

    // Check if the onClickActive function has been called
    expect(sampleProject.onClickActive).toHaveBeenCalledTimes(1);
  });

  it('triggers delete action on button click', () => {
    const sampleProject = {
      projectId: 1,
      index: 0,
      name: 'Sample Project',
      category: 'Unspecified',
      active: true,
      onUpdateProjectName: jest.fn(),
      onClickActive: jest.fn(),
      onClickDelete: jest.fn(),
      hasPermission: true,
    };

    const { getByTestId } = renderProject(sampleProject);

    // Find the delete button and click it
    const deleteButton = getByTestId('delete-button');
    fireEvent.click(deleteButton);

    // Check if the onClickDelete function has been called
    expect(sampleProject.onClickDelete).toHaveBeenCalledTimes(1);
  });

});
