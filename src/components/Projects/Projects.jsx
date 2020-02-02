/*********************************************************************************
 * Component: PROJECTS  
 * Author: Henry Ng - 01/27/20
 * This component is used to build the layout of the list of projects
 * Childrens: Overview, ProjectTableHeader, Project ( List )
 * Layout: <Overview>
 *         <ProjectTableHeader>
 *         {  <Project>...  } 
 * 
 * DO NOT WORK ON THE ACTIVE YET ******
 ********************************************************************************/
import React, { Component } from 'react'
import { fetchAllProjects, postNewProject, deleteProject, modifyProject } from '../../actions/projects'
import Overview from './Overview'
import AddProject from './AddProject'
import ProjectTableHeader from './ProjectTableHeader'
import Project from './Project'
import ModalDelete from './../common/Modal'
import ModalMsg from './../common/Modal'
import * as Message from './../../languages/en/messages'
import { NOTICE } from './../../languages/en/ui'
import './projects.css'
import { connect } from 'react-redux'
import Loading from '../common/Loading'

class Projects extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showModalDelete: false,
      showModalMsg: false,
      trackModelMsg: false,
      projectTarget: {
        projectName: '',
        projectId: -1,
        active: false
      }
    };
  }

  componentDidMount() {
    this.props.fetchAllProjects(); // Fetch to get all projects 
  }


  /**
   * Changes the number of active projects 
   */
  onClickActive = (projectId, projectName, isActive) => {
    this.props.modifyProject("setActive", projectId, projectName, isActive);
  }

  onUpdateProjectName = (projectId, projectName, isActive) => {
    this.props.modifyProject("updateName", projectId, projectName, isActive);
  }

  /**
   * Changes the number of projects
   * Also update the number of active project
   */
  onClickDelete = (projectId, active, projectName) => {
    this.setState({
      showModalDelete: true,
      projectTarget: {
        projectId,
        projectName,
        active
      }
    })
  }

  confirmDelete = () => {
    // get project info
    let { projectId } = this.state.projectTarget;
    // request delete on db
    this.props.deleteProject(projectId);
    // disable modal 
    this.setState({ showModalDelete: false });
  }

  setInactiveProject = () => {
    let { projectId, projectName } = this.state.projectTarget;
    this.props.modifyProject("setActive", projectId, projectName, true);
    // disable modal 
    this.setState({ showModalDelete: false });

  }

  addProject = (name) => {
    this.props.postNewProject(name, true);
    this.setState({ trackModelMsg: true });
  }




  render() {

    let { showModalDelete, projectTarget, trackModelMsg } = this.state;
    let { projects, status, fetching, fetched } = this.props.state.allProjects;


    let numberOfProjects = projects.length;
    let numberOfActive = projects.filter(project => project.isActive).length;

    let showModalMsg = false;
    //console.log("STSTUS", status);

    if (status !== 201 && trackModelMsg) {
      showModalMsg = true;
    }
    // Display project lists 
    let ProjectsList = [];
    if (projects.length > 0) {
      ProjectsList = projects.map((project, index) => <Project
        key={project._id}
        index={index}
        projectId={project._id}
        name={project.projectName}
        active={project.isActive}
        onClickActive={this.onClickActive}
        onUpdateProjectName={this.onUpdateProjectName}
        onClickDelete={this.onClickDelete}
        confirmDelete={this.confirmDelete}

      />);
    }



    return (
      <React.Fragment>
        <div className='container'>
          {fetching || !fetched ? <Loading /> : null}
          <Overview numberOfProjects={numberOfProjects} numberOfActive={numberOfActive} />
          <AddProject addNewProject={this.addProject} />
          <table className="table table-bordered table-responsive-sm">
            <thead>
              <ProjectTableHeader />
            </thead>
            <tbody>
              {ProjectsList}
            </tbody>
          </table>

        </div>


        <ModalDelete
          isOpen={showModalDelete}
          closeModal={() => { this.setState({ showModalDelete: false }) }}
          confirmModal={() => this.confirmDelete()}
          setInactiveModal={() => this.setInactiveProject()}
          modalMessage={Message.ARE_YOU_SURE_YOU_WANT_TO + Message.DELETE + " \"" + projectTarget.projectName + "\"? "
            + Message.THIS_ACTION_CAN_NOT_BE_UNDONE + ". "
            + Message.SWITCH_THEM_TO_INACTIVE_IF_YOU_LIKE_TO_KEEP_THEM_IN_THE_SYSTEM}
          modalTitle={Message.CONFIRM_DELETION}
        />

        <ModalMsg
          isOpen={showModalMsg}
          closeModal={() => { this.setState({ showModalMsg: false, trackModelMsg: false }) }}
          modalMessage={Message.THIS_PROJECT_NAME_IS_ALREADY_TAKEN}
          modalTitle={NOTICE}
        />

      </React.Fragment>
    )
  }
}

const mapStateToProps = state => { return { state } }
export default connect(mapStateToProps, { fetchAllProjects, postNewProject, deleteProject, modifyProject })(Projects)
