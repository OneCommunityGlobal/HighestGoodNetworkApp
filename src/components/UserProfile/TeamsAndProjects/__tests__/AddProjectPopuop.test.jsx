import { render, fireEvent, waitFor } from '@testing-library/react';
import AddProjectPopup from '../AddProjectPopup';

describe('AddProjectPopup component', () => {
  const onCloseMock = jest.fn();
  const onSelectAssignProjectMock = jest.fn();

  const userProjectsByIdMock = []; // Mock user projects
  const projectsMock = []; // Mock projects

  const props = {
    open: true,
    onClose: onCloseMock,
    onSelectAssignProject: onSelectAssignProjectMock,
    userProjectsById: userProjectsByIdMock,
    projects: projectsMock,
  };

  it('renders without crashing', () => {
    render(<AddProjectPopup {...props} />);
  });

  it('calls onClose when Close button is clicked', () => {
    const { getByText } = render(<AddProjectPopup {...props} />);
    const closeButton = getByText('Close');
    fireEvent.click(closeButton);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('calls onSelectAssignProject and resets selectedProject when Confirm button is clicked', async () => {
    const { getByText } = render(<AddProjectPopup {...props} />);
    const confirmButton = getByText('Confirm');
    fireEvent.click(confirmButton);
    await waitFor(() => {
      expect(onSelectAssignProjectMock).not.toHaveBeenCalled();
      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });

  it('shows error alert when attempting to confirm without selecting a project', () => {
    const { getByText } = render(<AddProjectPopup {...props} />);
    const confirmButton = getByText('Confirm');
    fireEvent.click(confirmButton);
    const errorAlert = getByText('Hey, You need to pick a project first!');
    expect(errorAlert).toBeInTheDocument();
  });

  it('shows error alert when attempting to confirm with an already selected project', () => {
    const selectedProject = { _id: '123', name: 'Test Project' };
    const propsWithSelectedProject = { ...props, selectedProject };
    const { getByText } = render(<AddProjectPopup {...propsWithSelectedProject} />);
    const confirmButton = getByText('Confirm');
    fireEvent.click(confirmButton);
    const errorAlert = getByText('Great idea, but they already have that one! Pick another!');
    expect(errorAlert).toBeInTheDocument();
  });
});
