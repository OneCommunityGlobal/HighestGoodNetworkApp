import React from 'react';
import { shallow } from 'enzyme';
import UserTeamProjectContainer from '../UserTeamProjectContainer';
import AddProjectPopup from '../AddProjectPopup';
import AddTeamPopup from '../AddTeamPopup';
import UserProjectsTable from '../UserProjectsTable';
import UserTeamsTable from '../UserTeamsTable';

describe('UserTeamProjectContainer Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <UserTeamProjectContainer
        teamsData={[]}
        userTeams={{}}
        userProjects={{}}
        projectsData={[]}
        onDeleteteam={() => {}}
        onDeleteProject={() => {}}
        onAssignTeam={() => {}}
        onAssignProject={() => {}}
      />
    );
  });

  it('renders without crashing', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should render AddTeamPopup component', () => {
    expect(wrapper.find(AddTeamPopup).exists()).toBe(true);
  });

  it('should render AddProjectPopup component', () => {
    expect(wrapper.find(AddProjectPopup).exists()).toBe(true);
  });

  it('should render UserTeamsTable component', () => {
    expect(wrapper.find(UserTeamsTable).exists()).toBe(true);
  });

  it('should render UserProjectsTable component', () => {
    expect(wrapper.find(UserProjectsTable).exists()).toBe(true);
  });

  it('should handle onSelectDeleteTeam correctly', () => {
    const teamId = 'team123';
    const onDeleteTeamMock = jest.fn();
    wrapper.setProps({ onDeleteteam: onDeleteTeamMock });
    wrapper.instance().onSelectDeleteTeam(teamId);
    expect(onDeleteTeamMock).toHaveBeenCalledWith(teamId);
  });

  it('should handle onSelectDeleteProject correctly', () => {
    const projectId = 'project123';
    const onDeleteProjectMock = jest.fn();
    wrapper.setProps({ onDeleteProject: onDeleteProjectMock });
    wrapper.instance().onSelectDeleteProject(projectId);
    expect(onDeleteProjectMock).toHaveBeenCalledWith(projectId);
  });

  it('should handle onSelectAssignTeam correctly', () => {
    const team = { id: 'team123', name: 'Team 123' };
    const onAssignTeamMock = jest.fn();
    wrapper.setProps({ onAssignTeam: onAssignTeamMock });
    wrapper.instance().onSelectAssignTeam(team);
    expect(onAssignTeamMock).toHaveBeenCalledWith(team);
    expect(wrapper.state('renderedOn')).not.toBe(0);
    expect(wrapper.state('addTeamPopupOpen')).toBe(false);
  });

  it('should handle onSelectAssignProject correctly', () => {
    const project = { id: 'project123', name: 'Project 123' };
    const onAssignProjectMock = jest.fn();
    wrapper.setProps({ onAssignProject: onAssignProjectMock });
    wrapper.instance().onSelectAssignProject(project);
    expect(onAssignProjectMock).toHaveBeenCalledWith(project);
    expect(wrapper.state('renderedOn')).not.toBe(0);
    expect(wrapper.state('postProjectPopupOpen')).toBe(false);
  });

  // Add more test cases as needed...
});
