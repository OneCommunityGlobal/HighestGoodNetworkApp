/*********************************************************************************
 * Component: PROJECTS  
 * Author: Henry Ng - 01/17/20
 * This component is used to build the layout of the list of projects
 * Childrens: Overview, ProjectTableHeader, Project ( List )
 * Layout: <Overview>
 *         <ProjectTableHeader>
 *         {  <Project>...  } 
 ********************************************************************************/
import React, { Component } from 'react'
import { fetchAllProjects, postNewProject, deleteProject } from '../../actions/projects'
import Overview from './Overview'
import AddProject from './AddProject'
import ProjectTableHeader from './ProjectTableHeader'
import Project from './Project'
import ModalDelete from './../common/Modal'
import ModalMsg from './../common/Modal'
import * as Message from './../../languages/en/messages'
import {NOTICE} from './../../languages/en/ui'
import './projects.css'
import { connect } from 'react-redux'

class Projects extends Component {

  constructor(props){
    super(props);
    this.state = {
      //projects: [],
      //numberOfProjects: 0,
      //numberOfActive: 0,
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

   componentDidMount =() =>{
    this.props.fetchAllProjects(); // Fetch to get all projects 
     let {projects} = this.props.state.allProjects; // Get data from props redux 
     let numberOfProjects = projects.length;
     let numberOfActive = projects.filter(project => project.isActive).length;
     this.setState({
       //projects,
       numberOfProjects,
       numberOfActive
      });
  }


  /**
   * Changes the number of active projects 
   */
  onClickActive = (status) => {
    let {numberOfActive} = this.state;
    if(status){
        numberOfActive--
    }else{
        numberOfActive++
    }
    this.setState({
      numberOfActive
    })
  }

  /**
   * Changes the number of projects
   * Also update the number of active project
   */
  onClickDelete= (projectId,active,projectName) => {
    this.setState({
      showModalDelete: true,
      projectTarget:{
        projectId,
        projectName,
        active
      }
    })
  }

  confirmDelete = () => {

    // get project info
    let {projectId,active} = this.state.projectTarget;


    // request delete on db
    this.props.deleteProject(projectId);

    /* disable animation 
    let v = document.getElementById(`tr_${projectId}`); 
    v.className += " isDisabled"; 
    */
   
    // update the states
    let {numberOfProjects,numberOfActive} = this.state;
    numberOfProjects--;

    // if the deleted project is active, update it 
    if(active){
      numberOfActive--;
    }
    this.setState({
      showModalDelete: false,
      numberOfProjects,
      numberOfActive
    })
  }

   addNewProjectLocal = (name) =>{
    this.props.postNewProject(name,true);
    this.setState({trackModelMsg:true});
  }

 
 

  render() {
    
    let {showModalDelete,projectTarget,trackModelMsg} = this.state;

    let {projects, status} = this.props.state.allProjects;
    const numberOfProjects = projects.length;
    const numberOfActive = projects.filter(project => project.isActive).length;
    let showModalMsg = false;
    //console.log("STSTUS",status);
    if(status !== 201 && trackModelMsg){
      showModalMsg= true;
    }
    // Display project lists 
    let ProjectsList = [];
    if(projects.length>0){
       ProjectsList = projects.map((project,index) => <Project 
          key={project._id} 
          index={index} 
          projectId={project._id} 
          name={project.projectName} 
          active={project.isActive} 
          onClickActive={this.onClickActive}
          onClickDelete={this.onClickDelete}
          confirmDelete={this.confirmDelete}

      />);
      }



    return (
      <React.Fragment>
        <div className='container'>
          <Overview numberOfProjects={numberOfProjects} numberOfActive={numberOfActive} />
          <AddProject addNewProject={this.addNewProjectLocal}/>
          <table className="table table-bordered table-responsive-sm">
            <thead>
            <ProjectTableHeader/>
            </thead>
            <tbody>
            {ProjectsList}
            </tbody>
          </table>

        </div>

       
        <ModalDelete
					isOpen={showModalDelete}
          closeModal={() => {this.setState({ showModalDelete: false })}}
          confirmModal={() => this.confirmDelete()}
					modalMessage={ Message.ARE_YOU_SURE_YOU_WANT_TO + Message.DELETE + " \""+projectTarget.projectName+"\"?"}
					modalTitle={Message.CONFIRM_DELETION}
				/>

        <ModalMsg
          	isOpen={showModalMsg}
            closeModal={() => {this.setState({ showModalMsg: false, trackModelMsg: false })}}
            modalMessage={Message.THIS_PROJECT_NAME_IS_ALREADY_TAKEN}
            modalTitle={NOTICE}
        />

      </React.Fragment>
    )
  }
}

const mapStateToProps = state => { return { state } }
export default connect(mapStateToProps,{fetchAllProjects, postNewProject, deleteProject})(Projects)

/**
 * 
 * 
 *  
 */