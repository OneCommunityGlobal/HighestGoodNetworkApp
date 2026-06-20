/*********************************************************************************
 * Component: ADDPROJECT
 * Author: Henry Ng - 01/17/20
 * This component is used to add more project into the database
 ********************************************************************************/
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { addNewWBS } from './../../../../actions/wbs';
import hasPermission from '~/utils/permissions';

const AddWBS = (props) => {
  const darkMode = props.state.theme.darkMode;
  const [taskTitle, setTaskTitle] = useState('');
  const canPostWBS = hasPermission('postWbs');

  const handleSubmit = () => {
    if (!taskTitle.trim()) return;
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(`Add task "${taskTitle}" to the database?`);
    if (confirmed) {
      props.addNewWBS(taskTitle, props.projectId);
      setTaskTitle(''); 
    }
  };

  return (
    <>
      {canPostWBS ? (
        <div className="input-group" id="new_project">
          <div className="input-group-prepend">
            <span className={`input-group-text ${darkMode ? 'bg-light-grey border-0' : ''}`}>Add new WBS</span>
          </div>

          <input
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            type="text"
            className={`form-control ${darkMode ? 'bg-white border-0' : ''}`}
            aria-label="WBS WBS"
            placeholder="WBS Name"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          <div className="input-group-append">
            {taskTitle.length >= 3 ? (
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={handleSubmit}
                data-testid="add-wbs-button"
              >
                <i className="fa fa-plus" aria-hidden="true"></i>
              </button>
            ) : null}
            {/* <button className="btn btn-primary" type="button" onClick={props.onSortAscending}>
              A ↓
            </button>
            <button className="btn btn-primary" type="button" onClick={props.onSortDescending}>
              D ↑
            </button> */}
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
})(AddWBS);
