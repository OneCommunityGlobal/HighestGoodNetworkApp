/*********************************************************************************
 * Component: postProject
 * Author: Henry Ng - 01/17/20
 * This component is used to add more project into the database
 ********************************************************************************/
import React, { useState } from 'react';
import Select from 'react-select';

const AddProject = props => {
  const [showAddButton, setShowAddButton] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState({ value: 'Unspecified', label: 'Select Category' });

  const options = [
    { value: 'Unspecified', label: 'Select Category' },
    { value: 'Food', label: 'Food' },
    { value: 'Energy', label: 'Energy' },
    { value: 'Housing', label: 'Housing' },
    { value: 'Education', label: 'Education' },
    { value: 'Society', label: 'Society' },
    { value: 'Economics', label: 'Economics' },
    { value: 'Stewardship', label: 'Stewardship' },
    { value: 'Other', label: 'Other' }
  ];

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
        <Select
          value={newCategory}
          onChange={setNewCategory}
          options={options}
        />
      </div>
      <div className="input-group-append">
        {showAddButton ? (
          <button
            className="btn btn-outline-primary"
            type="button"
            onClick={() => props.onAddNewProject(newName, newCategory)}
          >
            <i className="fa fa-plus" aria-hidden="true"></i>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default AddProject;
