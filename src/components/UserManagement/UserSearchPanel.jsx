import React from 'react';
import { SEARCH, SHOW, CREATE_NEW_USER } from '../../languages/en/ui';

/**
 * The search panel stateless component for user management grid
 */
const UserSearchPanel = props => {
  return (
    <div className="input-group mt-3" id="new_usermanagement">
      <button
        type="button"
        className="btn btn-info"
        onClick={e => {
          props.onNewUserClick();
        }}
      >
        {CREATE_NEW_USER}
      </button>
      <div className="input-group-prepend" style={{ marginLeft: '10px' }}>
        <span className="input-group-text">{SEARCH}</span>
      </div>
      <input
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
      <div className="input-group-prepend" style={{ marginLeft: '10px' }}>
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

export default UserSearchPanel;
