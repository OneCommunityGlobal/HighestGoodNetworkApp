import { boxStyle } from 'styles';
import { SEARCH, SHOW, CREATE_NEW_USER, SEND_SETUP_LINK } from '../../languages/en/ui';
/**
 * The search panel stateless component for user management grid
 */
function UserSearchPanel(props) {
  const { handleNewUserSetupPopup, onNewUserClick, onSearch, onActiveFiter, searchText } = props;
  return (
    <div className="input-group mt-3" id="new_usermanagement">
      <button type="button" className="btn btn-info mr-2" onClick={handleNewUserSetupPopup}>
        {SEND_SETUP_LINK}
      </button>
      <button
        type="button"
        className="btn btn-info mr-2"
        onClick={() => {
          onNewUserClick();
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

      <div className="input-group-append" />
    </div>
  );
}

export default UserSearchPanel;
