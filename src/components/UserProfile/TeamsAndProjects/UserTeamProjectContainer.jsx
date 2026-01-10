import React from 'react';
import { Container } from 'reactstrap';
import AddProjectPopup from './AddProjectPopup';
import AddTeamPopup from './AddTeamPopup';
import UserProjectsTable from './UserProjectsTable';
import UserTeamsTable from './UserTeamsTable';

class UserTeamProjectContainer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      addTeamPopupOpen: false,
      postProjectPopupOpen: false,
      renderedOn: 0,
    };
  }

  render() {
    return (
      <Container fluid>
        <AddTeamPopup
          open={this.state.addTeamPopupOpen}
          onClose={this.onAddTeamPopupClose}
          teamsData={this.props.teamsData}
          userTeamsById={this.props.userTeams}
          onSelectAssignTeam={this.onSelectAssignTeam}
        />
        <AddProjectPopup
          open={this.state.postProjectPopupOpen}
          onClose={this.onAddProjectPopupClose}
          userProjectsById={this.props.userProjects}
          projects={this.props.projectsData}
          onSelectAssignProject={this.onSelectAssignProject}
        />

        <div>
          <div className="row">
            <div className="col">
              <UserTeamsTable
                userTeamsById={this.props.userTeams}
                onButtonClick={this.onAddTeamPopupShow}
                onDeleteClick={this.onSelectDeleteTeam}
                renderedOn={this.state.renderedOn}
              />
            </div>
            <div className="col">
              <UserProjectsTable
                userProjectsById={this.props.userProjects}
                onButtonClick={this.onAddProjectPopupShow}
                onDeleteClicK={this.onSelectDeleteProject}
                renderedOn={this.state.renderedOn}
              />
            </div>
          </div>
        </div>
      </Container>
    );
  }

  onSelectDeleteTeam = teamId => {
    this.props.onDeleteteam(teamId);
  };

  onSelectDeleteProject = projectId => {
    this.props.onDeleteProject(projectId);
  };

  onSelectAssignTeam = team => {
    this.props.onAssignTeam(team);
    this.setState({
      renderedOn: Date.now(),
      addTeamPopupOpen: false,
    });
  };

  onSelectAssignProject = project => {
    this.props.onAssignProject(project);
    this.setState({
      renderedOn: Date.now(),
      postProjectPopupOpen: false,
    });
  };

  onAddProjectPopupShow = () => {
    this.setState({
      postProjectPopupOpen: true,
    });
  };

  onAddProjectPopupClose = () => {
    this.setState({
      postProjectPopupOpen: false,
    });
  };

  onAddTeamPopupShow = () => {
    this.setState({
      addTeamPopupOpen: true,
    });
  };

  onAddTeamPopupClose = () => {
    this.setState({
      addTeamPopupOpen: false,
    });
  };
}
export default UserTeamProjectContainer;
