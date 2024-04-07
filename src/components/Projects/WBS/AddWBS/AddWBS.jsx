/*********************************************************************************
 * Component: ADDPROJECT
 * Author: Henry Ng - 01/17/20
 * This component is used to add more project into the database
 ********************************************************************************/
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { addNewWBS } from './../../../../actions/wbs';
import hasPermission from 'utils/permissions';
import './AddWBS.css';

const AddWBS = props => {
  const [showAddButton, setShowAddButton] = useState(false);
  const [newName, setNewName] = useState('');
  const canPostWBS = props.hasPermission('postWbs');

  const toggleSortAscending = () => {
    props.toggleSortAscending(); // Notify parent component about the ascending sorting order change
  };

  const toggleSortDescending = () => {
    props.toggleSortDescending(); // Notify parent component about the descending sorting order change
  };

  const changeNewName = newName => {
    if (newName.length !== 0) {
      setShowAddButton(true);
    } else {
      setShowAddButton(false);
    }
    setNewName(newName);
  };

  const handleAddWBS = () => {
    props.addNewWBS(newName, props.projectId);
    setNewName(''); // Clear input field after adding
    setShowAddButton(false); // Hide add button after adding
  };

  return (
    <>
      {canPostWBS ? (
        <div className="input-group" id="new_project">
          <div className="input-group-prepend">
            <span className="input-group-text">Add new WBS</span>
          </div>

          <input
            autoFocus
            type="text"
            className="form-control"
            aria-label="WBS WBS"
            placeholder="WBS Name"
            onChange={e => changeNewName(e.target.value)}
          />
          <button className="btn btn-primary btn-border" type="button" onClick={toggleSortAscending}>
              &uarr;
            </button>
            <button className="btn btn-primary btn-border" type="button" onClick={toggleSortDescending}>
              &darr;
            </button>
          <div className="input-group-append">
            {showAddButton ? (
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={handleAddWBS}
              >
                <i className="fa fa-plus" aria-hidden="true"></i>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
};
const mapStateToProps = state => {
  return { state };
};
export default connect(mapStateToProps, {
  addNewWBS,
  hasPermission,
})(AddWBS);
