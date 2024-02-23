import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import Project from './Project';
import thunk from 'redux-thunk'
import { authMock, rolesMock, userProfileMock } from '../../../__tests__/mockStates';

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares);

const renderProject = props => {
  const store = mockStore({
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
  });

  return render(
    <Provider store={store}>
      {/* Wrap your component with BrowserRouter */}
      <BrowserRouter>
        <Project {...props} />
      </BrowserRouter>
    </Provider>
  );
}
  

describe('Project Component', () => {

  it('renders correctly with props',() => {

    const sampleProject = {
      projectId: 1,
      index: 0,
      name: 'Sample Project',
      category: 'Unspecified',
      active: true,
      onUpdateProjectName: jest.fn(),
      onClickActive: jest.fn(),
      onClickDelete: jest.fn(),
    };

    const { getByDisplayValue, getByTestId } = renderProject(sampleProject);

    // Use getByDisplayValue to find the input element with the specified value
    const inputElement = getByDisplayValue('Sample Project');

    // Check if the input element is present
    expect(inputElement).toBeInTheDocument();

    expect(getByTestId('project-active')).toBeInTheDocument();
    expect(getByTestId('delete-button')).toBeInTheDocument();

    // Verify the default value
    expect(getByDisplayValue('Unspecified')).toBeInTheDocument();
  });

  it('updates project name on input change', async () => {
    const sampleProject = {
      projectId: 1,
      index: 0,
      name: 'Sample Project',
      category: 'Unspecified',
      active: true,
      onUpdateProjectName: jest.fn(),
      onClickActive: jest.fn(),
      onClickDelete: jest.fn(),
    };
  
    const { getByTestId, getByDisplayValue } = renderProject(sampleProject);
  
    // Find the input element using getByDisplayValue
    const inputElement = getByDisplayValue('Sample Project');
  
    // Check if the input element is present
    expect(inputElement).toBeInTheDocument();
  
    // Simulate a user changing the input value
    fireEvent.change(inputElement, { target: { value: 'New Project Name' } });
  

    await waitFor(() => {
      // Check if the input value has been updated
      expect(getByDisplayValue('New Project Name')).toBeInTheDocument();
      
    });
  
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
    };

    const { getByTestId } = renderProject(sampleProject);

    // Find the delete button and click it
    const deleteButton = getByTestId('delete-button');
    fireEvent.click(deleteButton);

    // Check if the onClickDelete function has been called
    expect(sampleProject.onClickDelete).toHaveBeenCalledTimes(1);
  });

});
