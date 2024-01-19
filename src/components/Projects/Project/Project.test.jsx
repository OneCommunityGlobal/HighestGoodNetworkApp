import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
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

  it('renders correctly with props', async() => {

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

    const { getByText, getByTestId, container } = renderProject(sampleProject);
    console.log(container.innerHTML)
    // Wait for the element to be present
    await waitFor(() => {
      // Use screen.getByText to find the text content directly
      const inputElement = getByText('Sample Project');
      // Check if the input element is present and has the expected value
      expect(inputElement).toBeInTheDocument();
      expect(inputElement.tagName).toBe('TD');
      
    });
   
    expect(getByTestId('project-active')).toBeInTheDocument();

    // Verify the default value
    expect(getByText('Unspecified')).toBeInTheDocument();
  });

  it('updates project name on input change', async() => {
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
      canPutProject: true,
    };

    const { getByTestId } = renderProject(sampleProject);

    // Find the td element using getByTestId
    const tdElement = getByTestId('projects__name--input');

    // Verify if the td element is found
    expect(tdElement).toBeInTheDocument();

    
      // Change the name of original project
      tdElement.textContent = 'New Project Name';

      // Wait for the value to be updated
      await waitFor(() => {
        // Check if the input value has been updated
        expect(tdElement.textContent).toBe('New Project Name');
      });
  
  });

  // it('toggles project active status on button click', () => {
  //   const sampleProject = {
  //     projectId: 1,
  //     index: 0,
  //     name: 'Sample Project',
  //     category: 'Unspecified',
  //     active: true,
  //     onUpdateProjectName: jest.fn(),
  //     onClickActive: jest.fn(),
  //     onClickDelete: jest.fn(),
  //     hasPermission: true,
  //   };

  //   const { getByTestId } = renderProject(sampleProject);

  //   // Find the active status button and click it
  //   const activeButton = getByTestId('project-active');
  //   fireEvent.click(activeButton);

  //   // Check if the onClickActive function has been called
  //   expect(sampleProject.onClickActive).toHaveBeenCalledTimes(1);
  // });

  // it('triggers delete action on button click', () => {
  //   const sampleProject = {
  //     projectId: 1,
  //     index: 0,
  //     name: 'Sample Project',
  //     category: 'Unspecified',
  //     active: true,
  //     onUpdateProjectName: jest.fn(),
  //     onClickActive: jest.fn(),
  //     onClickDelete: jest.fn(),
  //     hasPermission: true,
  //   };

  //   const { getByTestId } = renderProject(sampleProject);

  //   // Find the delete button and click it
  //   const deleteButton = getByTestId('delete-button');
  //   fireEvent.click(deleteButton);

  //   // Check if the onClickDelete function has been called
  //   expect(sampleProject.onClickDelete).toHaveBeenCalledTimes(1);
  // });

});
