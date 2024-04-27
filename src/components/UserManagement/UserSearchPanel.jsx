import React from 'react';
import { SEARCH, SHOW, CREATE_NEW_USER, SEND_SETUP_LINK } from '../../languages/en/ui';
import { boxStyle, boxStyleDark } from 'styles';
/**
 * The search panel stateless component for user management grid
 */
const UserSearchPanel = ({handleNewUserSetupPopup, onNewUserClick, searchText, onSearch, onActiveFiter, darkMode}) => {
  // console.log('UserSearchPanel props', props);

  return (
    <div className="input-group mt-3" id="new_usermanagement">
      <button type="button" className="btn btn-info mr-2" onClick={handleNewUserSetupPopup} style={darkMode ? boxStyleDark : boxStyle}>
        {SEND_SETUP_LINK}
      </button>
      <button
        type="button"
        className="btn btn-info mr-2"
        onClick={e => {
          onNewUserClick();
        }}
        style={darkMode ? boxStyleDark : boxStyle}
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
        value={searchText}
        onChange={e => {
          onSearch(e.target.value);
        }}
      />
      <div className="input-group-prepend ml-2">
        <span className="input-group-text">{SHOW}</span>
        <select
          id="active-filter-dropdown"
          onChange={e => {
            onActiveFiter(e.target.value);
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
