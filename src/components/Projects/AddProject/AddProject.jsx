/*********************************************************************************
 * Component: ADDPROJECT 
 * Author: Henry Ng - 01/17/20
 * This component is used to add more project into the database
 ********************************************************************************/
import React, { useState } from 'react'
import {PROJECTS, ACTIVE_PROJECTS} from './../../../languages/en/ui'


const AddProject = (props) => {
   const [showAddButton, setShowAddButton] = useState(false);
   const [newName, setNewName] = useState('');

   const changeNewName = (newName) =>{
        if(newName.length!==0){
            setShowAddButton(true);
        }else{
            setShowAddButton(false);
        }
        setNewName(newName); 
   }

    return (
        <div className="input-group" id="new_project">
            <div className="input-group-prepend">
            <span className="input-group-text" >Add new project</span>
            </div>

            <input type="text" className="form-control" aria-label="New Project" placeholder="Project Name" onChange={(e) => changeNewName(e.target.value)}/>
                    <div className="input-group-append">
                    { showAddButton ? 
                    <button className="btn btn-outline-primary" type="button" onClick={(e) => props.addNewProject(newName)}>
                        <i className="fa fa-plus" aria-hidden="true"></i>
                    </button>
                    : null
                    }
            </div>
        </div>
        )
}

export default AddProject;

