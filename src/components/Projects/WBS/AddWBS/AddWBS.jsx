/*********************************************************************************
 * Component: ADDPROJECT
 * Author: Henry Ng - 01/17/20
 * This component is used to add more project into the database
 ********************************************************************************/
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { addNewWBS } from './../../../../actions/wbs';
import { UserRole } from './../../../../utils/enums';

const AddWBS = (props) => {
  const [role] = useState(props.state ? props.state.auth.user.role : null);
  const [showAddButton, setShowAddButton] = useState(false);
  const [newName, setNewName] = useState('');

  const changeNewName = (newName) => {
    if (newName.length !== 0) {
      setShowAddButton(true);
    } else {
      setShowAddButton(false);
    }
    setNewName(newName);
  };

  return (
    <>
      {props.state.auth.user.role === UserRole.Administrator ? (
        <div className="input-group" id="new_project">
          <div className="input-group-prepend">
            <span className="input-group-text">Add new WBS</span>
          </div>

          <input
            type="text"
            className="form-control"
            aria-label="WBS WBS"
            placeholder="WBS Name"
            onChange={(e) => changeNewName(e.target.value)}
          />
          <div className="input-group-append">
            {showAddButton ? (
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={(e) => props.addNewWBS(newName, props.projectId)}
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
const mapStateToProps = (state) => {
  return { state };
};
export default connect(mapStateToProps, { addNewWBS })(AddWBS);
