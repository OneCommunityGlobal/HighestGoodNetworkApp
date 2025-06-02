/* eslint-disable func-names */
import { render, fireEvent } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom/extend-expect';
import ProjectsTab from '../ProjectsTab';

const mockStore = configureMockStore([thunk]);
const defaultState = {};

function renderWithRedux(
  ui,
  { initialState = defaultState, store = mockStore(initialState) } = {},
) {
  return render(<Provider store={store}>{ui}</Provider>);
}

test('setup mock store and provider', () => {
  const store = mockStore(defaultState);
  expect(store.getState()).toEqual(defaultState);
});

describe('ProjectsTab', () => {
  const projectsData = [];
  const userProjects = [];
  const onDeleteProject = jest.fn();
  const onAssignProject = jest.fn();
  const edit = true;
  const role = 'admin';
  const userTasks = [];
  const userId = '123';
  const updateTask = jest.fn();
  const handleSubmit = jest.fn();
  const disabled = false;

  it('should render AddProjectPopup and UserProjectsTable components', () => {
    const { getByTestId } = renderWithRedux(<ProjectsTab />);
    expect(getByTestId('add-project-popup')).toBeInTheDocument();
    expect(getByTestId('user-projects-table')).toBeInTheDocument();
  });

  it('should render all the props correctly', () => {
    const { getByTestId } = renderWithRedux(
      <ProjectsTab
        projectsData={projectsData}
        userProjects={userProjects}
        onDeleteProject={onDeleteProject}
        onAssignProject={onAssignProject}
        edit={edit}
        role={role}
        userTasks={userTasks}
        userId={userId}
        updateTask={updateTask}
        handleSubmit={handleSubmit}
        disabled={disabled}
      />,
    );

    const popupInfo = getByTestId('popup-info');
    expect(popupInfo.getAttribute('data-projects')).toBe(JSON.stringify(projectsData));
    expect(popupInfo.getAttribute('data-userprojectsbyid')).toBe(JSON.stringify(userProjects));
    expect(popupInfo).toHaveAttribute('data-handlesubmit', 'true');

    const tableInfo = getByTestId('table-info');
    expect(tableInfo.getAttribute('data-usertasks')).toBe(JSON.stringify(userTasks));
    expect(tableInfo.getAttribute('data-userprojectsbyid')).toBe(JSON.stringify(userProjects));
    expect(tableInfo).toHaveAttribute('data-edit', edit.toString());
    expect(tableInfo).toHaveAttribute('data-role', role);
    expect(tableInfo).toHaveAttribute('data-userid', userId);
    expect(tableInfo).toHaveAttribute('data-disabled', disabled.toString());
  });

  it('should call onAssignProject when project is selected in AddProjectPopup', () => {
    const { getByTestId } = renderWithRedux(<ProjectsTab onAssignProject={onAssignProject} />);
    fireEvent.click(getByTestId('assign-btn'));
    expect(onAssignProject).toHaveBeenCalledWith({ _id: '123' });
  });

  it('should call onDeleteProject when project is deleted in UserProjectsTable', () => {
    const { getByTestId } = renderWithRedux(<ProjectsTab onDeleteProject={onDeleteProject} />);
    fireEvent.click(getByTestId('delete-btn'));
    expect(onDeleteProject).toHaveBeenCalledWith('123');
  });

  it('should have undefined handleSubmit prop', () => {
    const { queryByTestId } = renderWithRedux(<ProjectsTab />);
    const popupInfo = queryByTestId('popup-info');
    expect(popupInfo).not.toHaveAttribute('data-handlesubmit');
  });

  it('should render UserProjectsTable and AddProjectPopup', () => {
    const { getByTestId } = renderWithRedux(<ProjectsTab />);
    expect(getByTestId('add-project-popup')).toBeInTheDocument();
    expect(getByTestId('user-projects-table')).toBeInTheDocument();
  });

  it('should render AddProjectPopup with empty userProjectsById', () => {
    const { getByTestId } = renderWithRedux(<ProjectsTab />);
    const popupInfo = getByTestId('popup-info');
    expect(popupInfo).not.toHaveAttribute('data-userprojectsbyid');
  });

  it('should render AddProjectPopup with no projects', () => {
    const { getByTestId } = renderWithRedux(<ProjectsTab projectsData={[]} />);
    expect(getByTestId('popup-info')).toHaveAttribute('data-projects', JSON.stringify([]));
  });

  it('should call onAssignProject with an undefined project', () => {
    const { getByTestId } = renderWithRedux(<ProjectsTab onAssignProject={onAssignProject} />);
    fireEvent.click(getByTestId('assign-undefined-btn'));
    expect(onAssignProject).toHaveBeenCalledWith(undefined);
  });

  it('should call onAssignProject with a project that has already been assigned to the user', () => {
    const userProjectsTest = [{ _id: '123' }];
    const { getByTestId } = renderWithRedux(
      <ProjectsTab
        projectsData={projectsData}
        userProjects={userProjectsTest}
        onDeleteProject={onDeleteProject}
        onAssignProject={onAssignProject}
        edit={edit}
        role={role}
        userTasks={userTasks}
        userId={userId}
        updateTask={updateTask}
        handleSubmit={handleSubmit}
        disabled={disabled}
      />,
    );
    fireEvent.click(getByTestId('assign-btn'));
    const popupInfo = getByTestId('popup-info');
    expect(popupInfo.getAttribute('data-userprojectsbyid')).toBe(JSON.stringify(userProjectsTest));
    expect(onAssignProject).toHaveBeenCalledWith({ _id: '123' });
  });
});

jest.mock(
  '../AddProjectPopup',
  () =>
    function(props) {
      const { projects, userProjectsById, onSelectAssignProject, handleSubmit, darkMode } = props;
      return (
        <div data-testid="add-project-popup">
          <div
            data-testid="popup-info"
            data-projects={JSON.stringify(projects)}
            data-userprojectsbyid={
              userProjectsById !== undefined ? JSON.stringify(userProjectsById) : undefined
            }
            data-darkmode={darkMode ? 'true' : 'false'}
            data-handlesubmit={handleSubmit ? 'true' : undefined}
          />
          <button
            type="button"
            aria-label="Assign Project"
            data-testid="assign-btn"
            onClick={() => onSelectAssignProject({ _id: '123' })}
          />
          <button
            type="button"
            aria-label="Assign Project"
            data-testid="assign-undefined-btn"
            onClick={() => onSelectAssignProject(undefined)}
          />
        </div>
      );
    },
);

jest.mock(
  '../UserProjectsTable',
  () =>
    function(props) {
      const {
        userTasks,
        userProjectsById,
        onButtonClick,
        onDeleteClicK,
        edit,
        role,
        userId,
        disabled,
        darkMode,
      } = props;
      return (
        <div data-testid="user-projects-table">
          <div
            data-testid="table-info"
            data-usertasks={JSON.stringify(userTasks)}
            data-userprojectsbyid={
              userProjectsById !== undefined ? JSON.stringify(userProjectsById) : undefined
            }
            data-edit={edit ? 'true' : 'false'}
            data-role={role}
            data-userid={userId}
            data-disabled={disabled ? 'true' : 'false'}
            data-darkmode={darkMode ? 'true' : 'false'}
          />
          <button
            type="button"
            data-testid="add-btn"
            onClick={onButtonClick}
            aria-label="Add Project"
          />
          <button
            type="button"
            data-testid="delete-btn"
            onClick={() => onDeleteClicK('123')}
            aria-label="Delete Project"
          />
        </div>
      );
    },
);
