/*********************************************************************************
 * Component: ADDPROJECT
 * Author: Henry Ng - 01/17/20
 * This component is used to add more project into the database
 ********************************************************************************/
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { addNewWBS } from './../../../../actions/wbs';
import hasPermission from 'utils/permissions';

const AddWBS = props => {
  const [showAddButton, setShowAddButton] = useState(false);
  const [newName, setNewName] = useState('');
  const canPostWBS = props.hasPermission('postWbs');

  const toggleSort = () => {
    props.toggleSort(); // Notify parent component about the sorting order change
  };

  const changeNewName = newName => {
    if (newName.length !== 0) {
      setShowAddButton(true);
    } else {
      setShowAddButton(false);
    }
    setNewName(newName);
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
          <button className="btn btn-primary" type="button" onClick={toggleSort}>
            Name
          </button>
          <div className="input-group-append">
            {showAddButton ? (
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={e => props.addNewWBS(newName, props.projectId)}
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
