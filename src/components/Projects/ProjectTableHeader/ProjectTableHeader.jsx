import React, { Component } from 'react'
import './../projects.css'

class ProjectTableHeader extends Component {

  

  render() {

   return (
    <tr>
            <th scope="col" id="projects__order">#</th>
            <th scope="col">Project Name</th>
            <th scope="col" id="projects__active">Active</th>
            <th scope="col" id="projects__members">Members</th>
            <th scope="col" id="projects__wbs">WBS</th>
            <th scope="col" id="projects__delete"></th>

     </tr>
    )
  }
}

export default ProjectTableHeader;

