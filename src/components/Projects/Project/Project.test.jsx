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
    isArchived: false,
  };

  const sampleProps = {
    projectData: sampleProjectData,
    index: 0,
    darkMode: false,
    hasPermission: vi.fn((permission) => true),
    onUpdateProject: vi.fn(),
    onClickArchiveBtn: vi.fn(),
    onClickProjectStatusBtn: vi.fn(),
  };

  it('renders correctly with props', () => {
    const { getByDisplayValue, getByText } = renderProject(sampleProps);

    // Check if the input element is present
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByDisplayValue('Sample Project')).toBeInTheDocument();

    // Verify the category value
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByText('Unspecified')).toBeInTheDocument();
  });

  it('updates project name on input change', async () => {
    const { getByDisplayValue } = renderProject(sampleProps);

    // Find the input element using getByDisplayValue
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const inputElement = getByDisplayValue('Sample Project');

    // Simulate a user changing the input value
    fireEvent.change(inputElement, { target: { value: 'New Project Name' } });

    await waitFor(() => {
      // Check if the input value has been updated
      // eslint-disable-next-line testing-library/prefer-screen-queries
      expect(getByDisplayValue('New Project Name')).toBeInTheDocument();
    });
  });

  it('toggles project active status on button click', async () => {
    const { getByTestId } = renderProject(sampleProps);

    // Find the active status button and click it
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const activeButton = getByTestId('project-active');
    fireEvent.click(activeButton);

    await waitFor(() => {
      // check if the active status is active after clicking
      // eslint-disable-next-line testing-library/prefer-screen-queries, testing-library/no-node-access
      const activeStatus = getByTestId('project-active').querySelector('i');
      expect(activeStatus).toHaveClass('fa-circle');
    });
  });
  // test which was failing
  // it('triggers delete action on button click', () => {
  //   const mockOnClickArchiveBtn = vi.fn();
  //   const { getByTestId } = renderProject({
  //     ...sampleProps,
  //     onClickArchiveBtn: mockOnClickArchiveBtn,
  //   });
  
  //   // eslint-disable-next-line testing-library/prefer-screen-queries
  //   const deleteButton = getByTestId('delete-button');
  //   fireEvent.click(deleteButton);
  
  //   expect(mockOnClickArchiveBtn).toHaveBeenCalledWith(expect.objectContaining({
  //     _id: sampleProjectData._id,
  //   }));
  // });
  it('calls archive handler when delete button is clicked', () => {
    const mockOnClickArchiveBtn = vi.fn();
    const { getByTestId } = renderProject({
      ...sampleProps,
      onClickArchiveBtn: mockOnClickArchiveBtn,
    });

    // eslint-disable-next-line testing-library/prefer-screen-queries
    const deleteButton = getByTestId('delete-button');
    fireEvent.click(deleteButton);

    expect(mockOnClickArchiveBtn).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: sampleProjectData._id,
      }),
    );
  });

  it('calls archive handler for archived projects as well', () => {
    const archivedProjectData = {
      ...sampleProjectData,
      isArchived: true,
    };
    const mockOnClickArchiveBtn = vi.fn();

    const { getByTestId } = renderProject({
      ...sampleProps,
      projectData: archivedProjectData,
      onClickArchiveBtn: mockOnClickArchiveBtn,
    });

    // eslint-disable-next-line testing-library/prefer-screen-queries
    const deleteButton = getByTestId('delete-button');
    fireEvent.click(deleteButton);

    expect(mockOnClickArchiveBtn).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: sampleProjectData._id,
        isArchived: true,
      }),
    );
  });
});
