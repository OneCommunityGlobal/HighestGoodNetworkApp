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
  const darkMode = props.state.theme.darkMode;
  const [newName, setNewName] = useState('');
  const [showAddButton, setShowAddButton] = useState(false);
  const canPostWBS = props.hasPermission('postWbs');

  const changeNewName = value => {
    setNewName(value);
    setShowAddButton(value.length >= 3);
  };

  const handleAddWBS = () => {
    if (newName.length >= 3) {
      props.addNewWBS(newName, props.projectId);
      setNewName('');
      setShowAddButton(false);
    }
  };

  return (
    <>
      {canPostWBS ? (
        <div className="input-group" id="new_project">
          <div className="input-group-prepend">
            <span className={`input-group-text ${darkMode ? 'bg-yinmn-blue border-0 text-light' : ''}`}>Add new WBS</span>
          </div>

          <input
            autoFocus
            type="text"
            className={`form-control ${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
            aria-label="WBS WBS"
            placeholder="WBS Name"
            onChange={e => changeNewName(e.target.value)}
          />
          <div className="input-group-append">
            {showAddButton ? (
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={handleAddWBS}
                data-testid="add-wbs-button"
              >
                <i className="fa fa-plus" aria-hidden="true"></i>
              </button>
            ) : null}
            <button className="btn btn-primary" type="button" onClick={props.onSortAscending}>
              A ↓
            </button>
            <button className="btn btn-primary" type="button" onClick={props.onSortDescending}>
              D ↑
            </button>
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
