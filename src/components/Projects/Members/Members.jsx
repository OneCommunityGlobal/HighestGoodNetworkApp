/*********************************************************************************
 * Component: MEMBERS  
 * Author: Henry Ng - 01/25/20
 * Display members of the project
 ********************************************************************************/
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {NavItem} from 'reactstrap'
import './members.css'

const Members = (props) => {
   const [newName, setNewName] = useState('');

   const changeNewName = (newName) =>{
        setNewName(newName); 
   }

   //const { projectId } = props.match.params

   //console.log(props)

    return (
        <React.Fragment>
        <div className='container'>
        
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <NavItem  tag={Link} to={`/projects/`}>
                    <button type="button" class="btn btn-secondary" >
                        <i class="fa fa-chevron-circle-left" aria-hidden="true"></i>
                    </button>
                </NavItem>

                <div id="member_project__name">
                    PROJECTS {props.projectId}
                </div>
                
            </ol>
        </nav>
          <table className="table table-bordered table-responsive-sm">
            <thead>
            <tr>
                <th scope="col" id="projects__order">#</th>
                <th scope="col"></th>
                <th scope="col" id="projects__active"></th>
                <th scope="col" id="projects__members"></th>
                <th scope="col" id="projects__wbs"></th>
                <th scope="col" id="projects__delete"></th>
            </tr>
            </thead>
            <tbody>

            </tbody>
          </table>
        </div>

        </React.Fragment>
        )
}

export default Members;

