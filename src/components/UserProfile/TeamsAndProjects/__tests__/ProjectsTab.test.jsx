import React from 'react';
import { vi } from 'vitest';

vi.mock('../AddProjectPopup', () => ({
  __esModule: true,
  default: function AddProjectPopupMock(props) {
    const { projects, userProjectsById, onSelectAssignProject = () => {}, handleSubmit, darkMode } = props;
    return (
      <div data-testid="add-project-popup">
        <div
          data-testid="popup-info"
          data-projects={JSON.stringify(projects || [])}
          data-userprojectsbyid={JSON.stringify(props.userProjects  || [])} // Always provide valid JSON
          data-darkmode={darkMode ? 'true' : 'false'}
          data-handlesubmit={handleSubmit ? 'true' : undefined}
        />
        <button data-testid="assign-btn" onClick={() => onSelectAssignProject({ _id: '123' })} />
        <button
          data-testid="assign-undefined-btn"
          onClick={() => onSelectAssignProject(undefined)}
        />
      </div>
    );
  },
}));

vi.mock('../UserProjectsTable', () => ({
  __esModule: true,
  default: function UserProjectsTableMock(props) {
    const {
      userTasks,
      userProjectsById,
      onButtonClick,
      onDeleteClick,
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
          data-usertasks={JSON.stringify(userTasks || [])}
          data-userprojectsbyid={JSON.stringify(userProjectsById || [])} // Fix default value
          data-edit={edit ? 'true' : 'false'}
          data-role={role}
          data-userid={userId}
          data-disabled={disabled ? 'true' : 'false'}
          data-darkmode={darkMode ? 'true' : 'false'}
        />
        <button data-testid="add-btn" onClick={onButtonClick} />
        <button data-testid="delete-btn" onClick={() => onDeleteClick('123')} />
      </div>
    );
  },
}));

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
  const onDeleteProject = vi.fn();
  const onAssignProject = vi.fn();
  const edit = true;
  const role = 'admin';
  const userTasks = [];
  const userId = '123';
  const updateTask = vi.fn();
  const handleSubmit = vi.fn();
  const disabled = false;

  it('should render AddProjectPopup and UserProjectsTable components', () => {
    const { getByTestId } = renderWithRedux(<ProjectsTab />);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByTestId('add-project-popup')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByTestId('user-projects-table')).toBeInTheDocument();
  });

  it('should render all the props correctly', () => {
    const { getByTestId } = renderWithRedux(
      <ProjectsTab
        projectsData={projectsData}
        userProjects={userProjects || []} 
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
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const popupInfo = getByTestId('popup-info');
    expect(popupInfo.getAttribute('data-projects')).toBe(JSON.stringify(projectsData));
    expect(popupInfo.getAttribute('data-userprojectsbyid')).toBe(JSON.stringify(userProjects || []));
    expect(popupInfo).not.toHaveAttribute('data-handlesubmit');

    // eslint-disable-next-line testing-library/prefer-screen-queries
    const tableInfo = getByTestId('table-info');
    expect(tableInfo.getAttribute('data-usertasks')).toBe(JSON.stringify(userTasks));
    expect(tableInfo.getAttribute('data-userprojectsbyid')).toBe(JSON.stringify(userProjects || []));
    expect(tableInfo).toHaveAttribute('data-edit', edit.toString());
    expect(tableInfo).toHaveAttribute('data-role', role);
    expect(tableInfo).toHaveAttribute('data-userid', userId);
    expect(tableInfo).toHaveAttribute('data-disabled', disabled.toString());
  });

  it('should call onAssignProject when project is selected in AddProjectPopup', () => {
    const { getByTestId } = renderWithRedux(<ProjectsTab onAssignProject={onAssignProject} />);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    fireEvent.click(getByTestId('assign-btn'));
    expect(onAssignProject).toHaveBeenCalledWith({ _id: '123' });
  });

  it('should call onDeleteProject when project is deleted in UserProjectsTable', () => {
    const { getByTestId } = renderWithRedux(<ProjectsTab onDeleteProject={onDeleteProject} />);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    fireEvent.click(getByTestId('delete-btn'));
    expect(onDeleteProject).toHaveBeenCalledWith('123');
  });

  it('should have undefined handleSubmit prop', () => {
    const { queryByTestId } = renderWithRedux(<ProjectsTab />);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const popupInfo = queryByTestId('popup-info');
    expect(popupInfo).not.toHaveAttribute('data-handlesubmit');
  });

  it('should render UserProjectsTable and AddProjectPopup', () => {
    const { getByTestId } = renderWithRedux(<ProjectsTab />);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByTestId('add-project-popup')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByTestId('user-projects-table')).toBeInTheDocument();
  });

  it('should render AddProjectPopup with empty userProjectsById', () => {
    const { getByTestId } = renderWithRedux(<ProjectsTab />);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const popupInfo = getByTestId('popup-info');
    expect(popupInfo.getAttribute('data-userprojectsbyid')).toBe(JSON.stringify([])); 
  });

  it('should render AddProjectPopup with no projects', () => {
    const { getByTestId } = renderWithRedux(<ProjectsTab projectsData={[]} />);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(getByTestId('popup-info')).toHaveAttribute('data-projects', JSON.stringify([]));
  });

  it('should call onAssignProject with an undefined project', () => {
    const { getByTestId } = renderWithRedux(<ProjectsTab onAssignProject={onAssignProject} />);
    // eslint-disable-next-line testing-library/prefer-screen-queries
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
    // eslint-disable-next-line testing-library/prefer-screen-queries
    fireEvent.click(getByTestId('assign-btn'));
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const popupInfo = getByTestId('popup-info');
    expect(popupInfo.getAttribute('data-userprojectsbyid')).toBe(JSON.stringify(userProjectsTest));
    expect(onAssignProject).toHaveBeenCalledWith({ _id: '123' });
  });
});
