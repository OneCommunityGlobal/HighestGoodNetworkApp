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
import { fetchAllProjects } from '../../actions/projects'
import Overview from './Overview'
import ProjectTableHeader from './ProjectTableHeader'
import Project from './Project'
import Modal from './../common/Modal'
import * as Message from './../../languages/en/messages'
import './projects.css'
import { connect } from 'react-redux'

class Projects extends Component {

  constructor(props){
    super(props);
    this.state = {
      projects: [],
      numberOfProjects: 0,
      numberOfActive: 0,
      showModal: false,
      projectTarget: {
        projectName: '',
        projectId: -1,
        active: false
      }
    };
  }

  componentDidMount() {
     this.props.fetchAllProjects(); // Fetch to get all projects 
     var projects = this.props.state.allProjects; // Get data from props redux 
     var numberOfProjects = projects.length;
     var numberOfActive = projects.filter(project => project.isActive).length;
     this.setState({
       projects,
       numberOfProjects,
       numberOfActive
      });
  }


  /**
   * Changes the number of active projects 
   */
  onClickActive = (status) => {
    var {numberOfActive} = this.state;
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
      showModal: true,
      projectTarget:{
        projectId,
        projectName,
        active
      }
    })
  }

  confirmDelete = () => {

    var {projectId,active,projectName} = this.state.projectTarget;

    var v = document.getElementById(`tr_${projectId}`); 
    v.className += " isDisabled"; 
    
    var {numberOfProjects,numberOfActive} = this.state;
    numberOfProjects--;

    // if the deleted project is active, update it 
    if(active){
      numberOfActive--;
    }
    this.setState({showModal: false})
  }


  render() {
    
    var {projects,numberOfProjects,numberOfActive,showModal,projectTarget} = this.state;

    // Display project lists 
    var ProjectsList = projects.map((project,index) => <Project 
        key={project._id} 
        index={index} 
        projectId={project._id} 
        name={project.projectName} 
        active={project.isActive} 
        onClickActive={this.onClickActive}
        onClickDelete={this.onClickDelete}
        confirmDelete={this.confirmDelete}

    />);

    return (
      <React.Fragment>
        <div className='container'>
        <Overview numberOfProjects={numberOfProjects} numberOfActive={numberOfActive} />
        <table className="table table-bordered table-responsive-sm">
          <thead>
           <ProjectTableHeader/>
          </thead>
          <tbody>
           {ProjectsList}
          </tbody>
        </table>
        </div>

           
        <Modal
					isOpen={showModal}
          closeModal={() => {this.setState({ showModal: false })}}
          confirmModal={() => this.confirmDelete()}
					modalMessage={ Message.ARE_YOU_SURE_YOU_WANT_TO + "\""+projectTarget.projectName+"\"?"}
					modalTitle={Message.CONFIRM_DELETION}
				/>

      </React.Fragment>
    )
  }
}

const mapStateToProps = state => { return { state } }
export default connect(mapStateToProps,{fetchAllProjects})(Projects)