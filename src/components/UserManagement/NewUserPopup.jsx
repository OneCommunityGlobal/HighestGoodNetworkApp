import React from 'react'
import UserProfile from '../UserProfile'

/**
 * Modal popup to show the user profile in create mode
 */
const NewUserPopup = React.memo((props) => {
  return <div id="newUserModal" role="dialog" className="modal"
    style={{ display: props.open ? "block" : "none" }} aria-hidden="true">
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h4 className="modal-title">Create New User</h4>
          <button type="button" className="close" onClick={(e) => { props.onUserPopupClose() }}>
            <span className="fa fa-remove"></span>
          </button>
        </div>
        <div className="modal-body">
          <UserProfile />
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-default"
            onClick={(e) => { props.onUserPopupClose() }}>Close</button>
        </div>
      </div>
    </div>
  </div>
});

export default NewUserPopup;