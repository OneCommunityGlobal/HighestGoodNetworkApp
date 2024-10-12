/*********************************************************************************
 * Component: postProject
 * Author: Henry Ng - 01/17/20
 * This component is used to add more project into the database
 ********************************************************************************/
import React, { useState } from 'react';

const AddProject = props => {
  const [showAddButton, setShowAddButton] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Unspecified');

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const changeNewName = newName => {
    setShowAddButton(newName.length !== 0);
    setNewName(newName);
  };

  const addProjectHandler = async () => {
    setLoading(true);
    await props.onAddNewProject(newName, newCategory);
    setLoading(false);
    setSuccessMessage('Project added successfully!');
    setNewName(''); 
    setShowAddButton(false);
    setTimeout(() => setSuccessMessage(''), 1000); 
  };

  return (
    <div className="input-group" id="new_project">
      <div className="input-group-prepend">
        <span className="input-group-text">Add new project</span>
      </div>
      <input
        type="text"
        className="form-control"
        aria-label="New Project"
        placeholder="Project Name (required)"
        onChange={e => changeNewName(e.target.value)}
      />
      <div className="input-group-append">
        <select onChange={e => setNewCategory(e.target.value)}>
          <option value="Unspecified" default>
            Select Category
          </option>
          <option value="Food">Food</option>
          <option value="Energy">Energy</option>
          <option value="Housing">Housing</option>
          <option value="Education">Education</option>
          <option value="Society">Society</option>
          <option value="Economics">Economics</option>
          <option value="Stewardship">Stewardship</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="input-group-append">
        {showAddButton ? (          
          <button
            className="btn btn-outline-primary" 
            type="button"
            onClick={addProjectHandler}
            style={{ animation: 'none' }} 
          >
            <i className="fa fa-plus" aria-hidden="true"></i>
          </button>
        ) : null}
      </div>
      {successMessage && (
        <div
        style={{
          position: 'fixed',
          top: '20px', 
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          padding: '10px',
          backgroundColor: '#4caf50',
          color: 'white',
          borderRadius: '5px',
          textAlign: 'center',
          width: '300px',
        }}
        >
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default AddProject;
