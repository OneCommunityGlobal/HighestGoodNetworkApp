/*********************************************************************************
 * Component: Project Table Header  
 * Author: Henry Ng - 01/17/20
 * This component is the top of the table. It displays titles.
 ********************************************************************************/
import React from 'react'
import './../projects.css'
import {PROJECT_NAME, ACTIVE, MEMBERS, WBS} from './../../../languages/en/ui'

const  ProjectTableHeader = () => {

   return (
    <tr>
            <th scope="col" id="projects__order">#</th>
            <th scope="col">{PROJECT_NAME}</th>
            <th scope="col" id="projects__active">{ACTIVE}</th>
            <th scope="col" id="projects__members">{MEMBERS}</th>
            <th scope="col" id="projects__wbs">{WBS}</th>
            <th scope="col" id="projects__delete"></th>

     </tr>
    )
  
}

export default ProjectTableHeader;

