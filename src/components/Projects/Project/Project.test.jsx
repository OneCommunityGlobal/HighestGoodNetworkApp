import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import Project from './Project';
import thunk from 'redux-thunk';
import { authMock, rolesMock, userProfileMock } from '../../../__tests__/mockStates';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const renderProject = (props) => {
  const store = mockStore({
    auth: authMock,
    userProfile: userProfileMock,
    role: rolesMock.role,
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Project {...props} />
      </BrowserRouter>
    </Provider>
  );
};

describe('Project Component', () => {
  const sampleProjectData = {
    _id: '1',
    projectName: 'Sample Project',
    category: 'Unspecified',
    isActive: true,
  };

  const sampleProps = {
    projectData: sampleProjectData,
    index: 0,
    darkMode: false,
    hasPermission: jest.fn((permission) => true),
    onUpdateProject: jest.fn(),
    onClickArchiveBtn: jest.fn(),
  };

  it('renders correctly with props', () => {
    const { getByDisplayValue, getByText } = renderProject(sampleProps);

    // Check if the input element is present
    expect(getByDisplayValue('Sample Project')).toBeInTheDocument();

    // Verify the category value
    expect(getByText('Unspecified')).toBeInTheDocument();
  });

  it('updates project name on input change', async () => {
    const { getByDisplayValue } = renderProject(sampleProps);

    // Find the input element using getByDisplayValue
    const inputElement = getByDisplayValue('Sample Project');

    // Simulate a user changing the input value
    fireEvent.change(inputElement, { target: { value: 'New Project Name' } });

    await waitFor(() => {
      // Check if the input value has been updated
      expect(getByDisplayValue('New Project Name')).toBeInTheDocument();
    });
  });

  it('toggles project active status on button click', () => {
    const { getByTestId } = renderProject(sampleProps);

    // Find the active status button and click it
    const activeButton = getByTestId('project-active');
    fireEvent.click(activeButton);

    // Check if the onUpdateProject function has been called
    expect(sampleProps.onUpdateProject).toHaveBeenCalledTimes(1);
  });

  it('triggers delete action on button click', () => {
    const { getByTestId } = renderProject(sampleProps);

    // Find the delete button and click it
    const deleteButton = getByTestId('delete-button');
    fireEvent.click(deleteButton);

    // Check if the onClickArchiveBtn function has been called
    expect(sampleProps.onClickArchiveBtn).toHaveBeenCalledTimes(1);
  });
});

