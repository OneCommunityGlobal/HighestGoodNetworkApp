import React from 'react'
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
      addProjectPopupOpen: false,

    }
  }
  render() {

    debugger;
    return (
      <Container fluid>
        <AddTeamPopup
          open={this.state.addTeamPopupOpen}
          onClose={this.onAddTeamPopupClose}
          teamsData={this.props.teamsData} />
        <AddProjectPopup
          open={this.state.addProjectPopupOpen}
          onClose={this.onAddProjectPopupClose}
          projectsData={this.props.projectsData} />

        <div className='container'  >
          <div className='row' >
            <div className='col'>
              <UserTeamsTable
                userTeamsById={this.props.userTeams}
                onButtonClick={this.onAddTeamPopupShow} />
            </div>
            <div className='col'>
              <UserProjectsTable
                userProjectsById={this.props.userProjects}
                onButtonClick={this.onAddProjectPopupShow} />
            </div>
          </div>
        </div>
      </Container>
    )
  }

  onAddProjectPopupShow = () => {
    this.setState({
      addProjectPopupOpen: true
    })
  }


  onAddProjectPopupClose = () => {
    this.setState({
      addProjectPopupOpen: false
    })
  }
  onAddTeamPopupShow = () => {
    this.setState({
      addTeamPopupOpen: true
    })
  }

  onAddTeamPopupClose = () => {
    this.setState({
      addTeamPopupOpen: false
    })
  }
}
export default UserTeamProjectContainer;

