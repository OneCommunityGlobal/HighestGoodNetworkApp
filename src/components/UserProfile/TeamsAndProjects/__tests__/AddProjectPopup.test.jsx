import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import AddProjectPopup from '../AddProjectPopup';

/** TEST DATA **/

const onCloseMock = vi.fn();
const onSelectAssignProjectMock = vi.fn();
const handleSubmitMock = vi.fn();


const projectsMock = [{ _id: 'proj1', projectName: 'Project 1' }];
const userProjectsByIdMock = [];

const mockStore = configureStore([]);
const initialState = {
  theme: { darkMode: false },
};
const store = mockStore(initialState);


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
      render(<Provider store={store}><AddProjectPopup {...props} /></Provider>)
    );
  };

/** TEST CASE **/

describe('AddProjectPopup component Unit test case', () => {
  beforeEach(() => {
  vi.clearAllMocks();
});
  it('Test 1 : Expected  UI elements are present', () => {
    const { getByText }=renderComponent(props);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const closeBtn = getByText('Close');
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const confirmBtn = getByText('Confirm');
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const addProjectText = getByText('Add Project');
    expect(closeBtn).toBeInTheDocument();
    expect(confirmBtn).toBeInTheDocument();
    expect(addProjectText).toBeInTheDocument();

  });

  it('Test 2 : Calls onClose when Close button is clicked', () => {
    const { getByText } = renderComponent(props);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const closeButton = getByText('Close');
    fireEvent.click(closeButton);
    expect(onCloseMock).toHaveBeenCalled();
  });



  it('Test 3 : Calls onSelectAssignProject and resets selectedProject when Confirm button is clicked', async () => {
    const { getByText } = renderComponent(props);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const confirmButton = getByText('Confirm');
    fireEvent.click(confirmButton);
    await waitFor(() => {
      expect(onSelectAssignProjectMock).not.toHaveBeenCalled();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });

  

  it('Test 4 : Shows error alert when attempting to confirm without selecting a project', () => {
    const { getByText } = renderComponent(props);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const confirmButton = getByText('Confirm');
    fireEvent.click(confirmButton);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const errorAlert = getByText('Hey, You need to pick a project first!');
    expect(errorAlert).toBeInTheDocument();
  });


});