/*********************************************************************************
 * Component: PROJECTS
 * Author: Henry Ng - 01/27/20
 * This component is used to build the layout of the list of projects
 * Childrens: Overview, ProjectTableHeader, Project ( List )
 * Layout: <Overview>
 *         <ProjectTableHeader>
 *         {  <Project>...  }
 *
 ********************************************************************************/
import React, { Component } from 'react';
import {
  fetchAllProjects,
  postNewProject,
  deleteProject,
  modifyProject,
} from '../../actions/projects';
import { getPopupById } from '../../actions/popupEditorAction';
import Overview from './Overview';
import AddProject from './AddProject';
import ProjectTableHeader from './ProjectTableHeader';
import Project from './Project';
import ModalDelete from './../common/Modal';
import ModalMsg from './../common/Modal';
import ProjectInfoModal from './ProjectInfoModal';
import * as Message from './../../languages/en/messages';
import { NOTICE } from './../../languages/en/ui';
import './projects.css';
import { connect } from 'react-redux';
import Loading from '../common/Loading';
import { PROJECT_DELETE_POPUP_ID } from './../../constants/popupId';
import hasPermission from '../../utils/permissions';
import EditableInfoModal from '../UserProfile/EditableModal/EditableInfoModal';

export class Projects extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModalDelete: false,
      showModalMsg: false,
      trackModelMsg: false,
      projectTarget: {
        projectName: '',
        projectId: -1,
        active: false,
      },
      projectInfoModal: false,
    };
  }

  componentDidMount() {
    this.props.getPopupById(PROJECT_DELETE_POPUP_ID); // popup id
    this.props.fetchAllProjects(); // Fetch to get all projects
  }

  /**
   * Changes the number of active projects
   */
  onClickActive = (projectId, projectName, category, isActive) => {
    this.props.modifyProject('setActive', projectId, projectName, category, isActive);
  };

  onUpdateProjectName = (projectId, projectName, category, isActive) => {
    console.log('updateName', projectId, projectName, category, isActive);
    this.props.modifyProject('updateName', projectId, projectName, category, isActive);
  };

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
        active,
      },
    });
  };

  confirmDelete = () => {
    // get project info
    let { projectId } = this.state.projectTarget;
    // request delete on db
    this.props.deleteProject(projectId);
    // disable modal
    this.setState({ showModalDelete: false });
  };

  setInactiveProject = () => {
    let { projectId, projectName } = this.state.projectTarget;
    this.props.modifyProject('setActive', projectId, projectName, true);
    // disable modal
    this.setState({ showModalDelete: false });
  };

  postProject = (name, category) => {
    this.props.postNewProject(name, category, true);
    this.setState({ trackModelMsg: true });
  };

  toggleProjectInfoModal = () => {
    this.setState({
      projectInfoModal: !this.state.projectInfoModal,
    });
  };

  render() {
    let { showModalDelete, projectTarget, trackModelMsg, projectInfoModal } = this.state;
    let { projects, status, fetching, fetched } = this.props.state.allProjects;

    let numberOfProjects = projects.length;
    let numberOfActive = projects.filter(project => project.isActive).length;

    let showModalMsg = false;


    const role = this.props.state.userProfile.role;

    const canPostProject = this.props.hasPermission('postProject') || this.props.hasPermission('seeProjectManagement');

    if (status === 400 && trackModelMsg) {
      showModalMsg = true;
    }

    // Display project lists
    let ProjectsList = [];
    if (projects.length > 0) {
      ProjectsList = projects.map((project, index) => (
        <Project
          key={project._id}
          index={index}
          projectId={project._id}
          name={project.projectName}
          category={project.category || 'Unspecified'}
          active={project.isActive}
          onClickActive={this.onClickActive}
          onUpdateProjectName={this.onUpdateProjectName}
          onClickDelete={this.onClickDelete}
          confirmDelete={this.confirmDelete}
        />
      ));
    }

    return (
      <React.Fragment>
        <div className="container mt-3">
          {fetching || !fetched ? <Loading /> : null}
          <div className="d-flex align-items-center">
          <h3 style={{ display: 'inline-block', marginRight: 10 }}>Projects</h3>
          <EditableInfoModal
            areaName="projectsInfoModal"
            areaTitle="Projects"
            fontSize={30}
            isPermissionPage={true}
            role={role}
          />
        </div>

          <Overview numberOfProjects={numberOfProjects} numberOfActive={numberOfActive} />
          {canPostProject ? <AddProject addNewProject={this.postProject} /> : null}

          <table className="table table-bordered table-responsive-sm">
            <thead>
              <ProjectTableHeader />
            </thead>
              <tbody>{ProjectsList}</tbody>
          </table>
        </div>

        <ModalDelete
          isOpen={showModalDelete}
          closeModal={() => {
            this.setState({ showModalDelete: false });
          }}
          confirmModal={() => this.confirmDelete()}
          setInactiveModal={() => this.setInactiveProject()}
          modalMessage={
            (this.props.state.popupEditor.currPopup.popupContent
              ? this.props.state.popupEditor.currPopup.popupContent.replace(
                  '[project_name]',
                  this.state.projectTarget.projectName,
                )
              : '') || ''
          }
          modalTitle={Message.CONFIRM_DELETION}
        />

        <ModalMsg
          isOpen={showModalMsg}
          closeModal={() => {
            this.setState({ showModalMsg: false, trackModelMsg: false });
          }}
          modalMessage={Message.THIS_PROJECT_NAME_IS_ALREADY_TAKEN}
          modalTitle={NOTICE}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return { state };
};
export default connect(mapStateToProps, {
  fetchAllProjects,
  postNewProject,
  deleteProject,
  modifyProject,
  getPopupById,
  hasPermission,
})(Projects);
