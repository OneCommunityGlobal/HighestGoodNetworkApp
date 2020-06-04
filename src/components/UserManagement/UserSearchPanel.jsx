import React from 'react'

const UserSearchPanel = (props) => {
  return (
    <div className="input-group" id="new_usermanagement">
      <button type="button" className="btn btn-info"
        onClick={(e) => { props.onNewUserClick() }}>Create New User</button>
      <div className="input-group-prepend" style={{ marginLeft: "10px" }}>
        <span className="input-group-text">Search</span>
      </div>
      <input type="text" className="form-control" aria-label="Search" placeholder="Search Text"
        onChange={(e) => {
          props.onSearch(e.target.value);
        }} />
      <div className="input-group-prepend" style={{ marginLeft: "10px" }}>
        <span className="input-group-text">Show</span>
        <select onChange={(e) => {
          props.onActiveFiter(e.target.value);
        }}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="input-group-append"></div>
    </div>
  )
}

export default UserSearchPanel;