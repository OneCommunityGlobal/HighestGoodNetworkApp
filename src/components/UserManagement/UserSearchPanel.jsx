import React, { useEffect,useState } from 'react';
import { SEARCH, SHOW, CREATE_NEW_USER, SEND_SETUP_LINK } from '../../languages/en/ui';
import { boxStyle } from 'styles';
import { useSelector } from 'react-redux';
/**
 * The search panel stateless component for user management grid
 */
const UserSearchPanel = props => {
  const [hasRole, setHasRole] = useState(false);
  const [isOwner,setIsOwner] = useState(false);
  const { user } = useSelector(state => state.auth);
  useEffect(() => {
    if (user.role === 'Owner'||user.role === 'Administrator') {
      setIsOwner(true)
    } else {
      setIsOwner(false)
      const hasValue = user.permissions.frontPermissions.some(value => value === 'postUserProfile');
      if (hasValue) {
        setHasRole(true);
      } else {
        setHasRole(false);
      }
    }
  },[])
  return (
    <div className="input-group mt-3" id="new_usermanagement">
      <button disabled={isOwner ? false : true} type="button" className="btn btn-info mr-2"
              onClick={props.handleNewUserSetupPopup}>
        {SEND_SETUP_LINK}
      </button>
      <button
        disabled={isOwner?false:!hasRole}
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

export default UserSearchPanel;
