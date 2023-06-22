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

  const changeNewName = newName => {
    if (newName.length !== 0) {
      setShowAddButton(true);
    } else {
      setShowAddButton(false);
    }
    setNewName(newName);
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
        placeholder="Project Name (required) type to add."
        onChange={e => changeNewName(e.target.value)}
      />
      <div className="input-group-append">
        <select onChange={e => setNewCategory(e.target.value)}>
          <option default value="Unspecified">
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
            onClick={e => props.addNewProject(newName, newCategory)}
          >
            <i className="fa fa-plus" aria-hidden="true"></i>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default AddProject;
