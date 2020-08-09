import React from 'react';
import { SEARCH, } from '../../languages/en/ui'

/**
 * The search panel stateless component for user management grid
 */
const TeamTablesearchPanel = (props) => {
  return (
    <div className="input-group" id="new_teams">


      <span className="input-group-text">{SEARCH}</span>

      <input type="text" className="form-control" aria-label="Search"
        placeholder="Search Text" id="user-profiles-wild-card-search"
        onChange={(e) => {
          props.onSearch(e.target.value);
        }} />



    </div>
  )
}

export default TeamTablesearchPanel;