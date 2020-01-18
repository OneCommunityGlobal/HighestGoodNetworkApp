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
import './projects.css'
import { connect } from 'react-redux'

class Projects extends Component {

  constructor(props){
    super(props);
    this.state = {
      projects: [],
      numberOfProjects: 0,
      numberOfActive: 0
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
  onClickDelete= (active) => {
    var {numberOfProjects,numberOfActive} = this.state;
    numberOfProjects--;

    // if the deleted project is active, update it 
    if(active){
      numberOfActive--;
    }
    this.setState({
      numberOfProjects,
      numberOfActive    
    })
  }


  render() {
    
    var {projects,numberOfProjects,numberOfActive} = this.state;

    // Display project lists 
    var ProjectsList = projects.map((project,index) => <Project 
        key={project._id} 
        index={index} 
        projectId={project._id} 
        name={project.projectName} 
        active={project.isActive} 
        onClickActive={this.onClickActive}
        onClickDelete={this.onClickDelete}

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
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => { return { state } }
export default connect(mapStateToProps,{fetchAllProjects})(Projects)