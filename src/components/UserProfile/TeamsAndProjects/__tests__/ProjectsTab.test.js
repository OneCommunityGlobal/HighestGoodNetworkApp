import React from 'react';
import AddProjectPopup from '../AddProjectPopup';
import UserProjectsTable from '../UserProjectsTable';
import { shallow } from 'enzyme';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ProjectsTab from '../ProjectsTab';

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

  // check for props rendering
  it('should render all the props correctly', () => {
    const wrapper = shallow(
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
      />
    );
    expect(wrapper.find(UserProjectsTable).prop('userTasks')).toEqual(userTasks);
    expect(wrapper.find(UserProjectsTable).prop('userProjectsById')).toEqual(userProjects);
    expect(wrapper.find(UserProjectsTable).prop('onButtonClick')).toBeInstanceOf(Function);
    expect(wrapper.find(UserProjectsTable).prop('onDeleteClicK')).toBeInstanceOf(Function);
    expect(wrapper.find(UserProjectsTable).prop('edit')).toEqual(edit);
    expect(wrapper.find(UserProjectsTable).prop('role')).toEqual(role);
    expect(typeof wrapper.find(UserProjectsTable).prop('updateTask')).toEqual('function');
    expect(wrapper.find(UserProjectsTable).prop('userId')).toEqual(userId);
    expect(wrapper.find(UserProjectsTable).prop('disabled')).toEqual(disabled);
  });

  it('should render AddProjectPopup and UserProjectsTable components', () => {
    const wrapper = shallow(<ProjectsTab />);
    expect(wrapper.find(AddProjectPopup)).toHaveLength(1);
    expect(wrapper.find(UserProjectsTable)).toHaveLength(1);
  });

  it('should call onAssignProject when project is selected in AddProjectPopup', () => {
    const onAssignProject = jest.fn();
    const wrapper = shallow(<ProjectsTab onAssignProject={onAssignProject} />);
    const addProjectPopup = wrapper.find(AddProjectPopup);
    addProjectPopup.props().onSelectAssignProject({ _id: '123' });
    expect(onAssignProject).toHaveBeenCalledWith({ _id: '123' });
  });

  it('should call onDeleteProject when project is deleted in UserProjectsTable', () => {
    const onDeleteProject = jest.fn();
    const wrapper = shallow(<ProjectsTab onDeleteProject={onDeleteProject} />);
    const userProjectsTable = wrapper.find(UserProjectsTable);
    userProjectsTable.props().onDeleteClicK('123');
    expect(onDeleteProject).toHaveBeenCalledWith('123');
  });

  // Edge cases
  it('should have undefined handleSubmit prop', () => {
    const wrapper = shallow(<ProjectsTab />);
    expect(wrapper.find(AddProjectPopup).prop('handleSubmit')).toBeUndefined();
  });

  it('should render UserProjectsTable and AddProjectPopup', () => {
    const wrapper = shallow(<ProjectsTab />);
    expect(wrapper.find(AddProjectPopup)).toHaveLength(1);
    expect(wrapper.find(UserProjectsTable)).toHaveLength(1);
  });

  it('should render AddProjectPopup with empty userProjectsById', () => {
    const wrapper = shallow(<ProjectsTab />);
    const addProjectPopup = wrapper.find(AddProjectPopup);
    expect(addProjectPopup.prop('userProjectsById')).toBe(undefined);
  });

  it('should render AddProjectPopup with no projects', () => {
    const wrapper = shallow(<ProjectsTab projectsData={[]} />);
    expect(wrapper.find(AddProjectPopup).prop('projects')).toEqual([]);
  });

  it('should call onAssignProject with an undefined project', () => {
    const onAssignProject = jest.fn();
    const wrapper = shallow(<ProjectsTab onAssignProject={onAssignProject} />);
    const addProjectPopup = wrapper.find(AddProjectPopup);
    addProjectPopup.props().onSelectAssignProject(undefined);
    expect(onAssignProject).toHaveBeenCalledWith(undefined);
  });

  it('should call onAssignProject with a project that has already been assigned to the user', () => {
    const userProjectsTest = [{ _id: '123' }];       
    const wrapper = shallow(
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
      />
    );
  
    const addProjectPopup = wrapper.find(AddProjectPopup);
    addProjectPopup.props().onSelectAssignProject({ _id: '123' });
    expect(wrapper.find(AddProjectPopup).prop('userProjectsById')).toEqual(userProjectsTest);
    expect(onAssignProject).toHaveBeenCalledWith({ _id: '123' });
  });
});

