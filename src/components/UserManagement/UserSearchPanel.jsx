import React from 'react';
import { SEARCH, SHOW, CREATE_NEW_USER, SEND_SETUP_LINK } from '../../languages/en/ui';
import { boxStyle } from 'styles';
import hasPermission from 'utils/permissions';
import { connect } from 'react-redux';
/**
 * The search panel stateless component for user management grid
 */
const UserSearchPanel = props => {
  const canCreateUsers = props.hasPermission('postUserProfile');
  return (
    <div className="input-group mt-3" id="new_usermanagement">
      <button disabled={!canCreateUsers} type="button" className="btn btn-info mr-2"
              onClick={props.handleNewUserSetupPopup}>
        {SEND_SETUP_LINK}
      </button>
      <button
        disabled={!canCreateUsers}
        type="button"
        className="btn btn-info mr-2"
        onClick={e => {
          props.onNewUserClick();
        }}
        style={boxStyle}
      >
        {CREATE_NEW_USER}
      </button>
      <div className="input-group-prepend">
        <span className="input-group-text">{SEARCH}</span>
      </div>
      <input
        autoFocus
        type="text"
        className="form-control"
        aria-label="Search"
        placeholder="Search Text"
        id="user-profiles-wild-card-search"
        value={props.searchText}
        onChange={e => {
          props.onSearch(e.target.value);
        }}
      />
      <div className="input-group-prepend ml-2">
        <span className="input-group-text">{SHOW}</span>
        <select
          id="active-filter-dropdown"
          onChange={e => {
            props.onActiveFiter(e.target.value);
          }}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      <div className="input-group-append"></div>
    </div>
  );
};
export default connect(null, { hasPermission })(UserSearchPanel);
