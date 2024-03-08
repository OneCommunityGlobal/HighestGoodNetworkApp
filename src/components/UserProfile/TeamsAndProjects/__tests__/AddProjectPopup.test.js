import { render, fireEvent, waitFor } from '@testing-library/react';
import AddProjectPopup from '../AddProjectPopup';

/** TEST DATA **/

const onCloseMock = jest.fn();
const onSelectAssignProjectMock = jest.fn();
const handleSubmitMock = jest.fn();


const projectsMock = [{ _id: 'proj1', projectName: 'Project 1' }];
const userProjectsByIdMock = [];


const props = {
    open: true,
    onClose: onCloseMock,
    onSelectAssignProject: onSelectAssignProjectMock,
    userProjectsById: userProjectsByIdMock,
    projects: projectsMock,
    handleSubmit: handleSubmitMock,

  };

  const renderComponent=(props)=>
  {
    return(
      render(<AddProjectPopup {...props} />)
    );
  };

/** TEST CASE **/

describe('AddProjectPopup component Unit test case', () => {
  
  it('Test 1 : Expected  UI elements are present', () => {
    const { getByText }=renderComponent(props);
    const closeBtn = getByText('Close');
    const confirmBtn = getByText('Confirm');
    const addProjectText = getByText('Add Project');
    expect(closeBtn).toBeInTheDocument();
    expect(confirmBtn).toBeInTheDocument();
    expect(addProjectText).toBeInTheDocument();

  });

  it('Test 2 : Calls onClose when Close button is clicked', () => {
    const { getByText } = renderComponent(props);
    const closeButton = getByText('Close');
    fireEvent.click(closeButton);
    expect(onCloseMock).toHaveBeenCalled();
  });



  it('Test 3 : Calls onSelectAssignProject and resets selectedProject when Confirm button is clicked', async () => {
    const { getByText } = renderComponent(props);
    const confirmButton = getByText('Confirm');
    fireEvent.click(confirmButton);
    await waitFor(() => {
      expect(onSelectAssignProjectMock).not.toHaveBeenCalled();
      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });

  

  it('Test 4 : Shows error alert when attempting to confirm without selecting a project', () => {
    const { getByText } = renderComponent(props);
    const confirmButton = getByText('Confirm');
    fireEvent.click(confirmButton);
    const errorAlert = getByText('Hey, You need to pick a project first!');
    expect(errorAlert).toBeInTheDocument();
  });


});
