import { useState } from 'react';
import { connect } from 'react-redux';
import { Tooltip as ReactstrapTooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { boxStyle, boxStyleDark } from '../../styles';
import hasPermission from '../../utils/permissions';
import { SEARCH, SHOW, CREATE_NEW_USER, SEND_SETUP_LINK } from '../../languages/en/ui';
import styles from './usermanagement.module.css';

const setupHistoryTooltip = <Tooltip id="tooltip">Setup History Modal</Tooltip>;

/**
 * The search panel stateless component for user management grid
 */
function UserSearchPanel({
  // eslint-disable-next-line no-shadow
  hasPermission,
  handleNewUserSetupPopup,
  handleSetupHistoryPopup,
  onNewUserClick,
  searchText,
  onSearch,
  onActiveFilter,
  darkMode,
  selectText,
}) {
  const canCreateUsers = hasPermission('postUserProfile');
  const [tooltipCreateNewUserOpen, setTooltipCreateNewUserOpen] = useState(false);
  const toggleCreateNewUserTooltip = () => setTooltipCreateNewUserOpen(!tooltipCreateNewUserOpen);

  return (
    <div className={`input-group mt-3 ${styles.new_user_management}`}>
      <button
        type="button"
        disabled={!canCreateUsers}
        className="btn btn-info mr-2"
        onClick={handleNewUserSetupPopup}
        style={darkMode ? boxStyleDark : boxStyle}
      >
        {SEND_SETUP_LINK}
      </button>
      
      <OverlayTrigger placement="bottom" overlay={setupHistoryTooltip}>
        <button
          type="button"
          className="btn btn-info mr-2"
          onClick={handleSetupHistoryPopup}
          style={darkMode ? boxStyleDark : boxStyle}
          aria-label="Setup History"
        >
          <FontAwesomeIcon className="bell_icon" icon={faBell} />
        </button>
      </OverlayTrigger>

      {!canCreateUsers ? (
        <ReactstrapTooltip
          placement="bottom"
          isOpen={tooltipCreateNewUserOpen}
          target="btn-create-new-user"
          toggle={toggleCreateNewUserTooltip}
        >
          You don&apos;t have permission to create a new user
        </ReactstrapTooltip>
      ) : (
        ''
      )}

      <button
        type="button"
        disabled={!canCreateUsers}
        className="btn btn-info mr-2"
        onClick={() => {
          onNewUserClick();
        }}
        style={darkMode ? boxStyleDark : boxStyle}
        id="btn-create-new-user"
      >
        {CREATE_NEW_USER}
      </button>

      {/* SEARCH Label Box - explicitly forced text-dark or clear color styling */}
      <div className="input-group-prepend">
        <span className={`input-group-text ${darkMode ? 'bg-yinmn-blue text-dark font-weight-bold' : ''}`}>
          {SEARCH}
        </span>
      </div>
      
      {/* Search Input Field */}
      <input
        type="text"
        className={`form-control ${darkMode ? 'bg-darkmode-liblack text-light' : ''}`}
        aria-label="Search"
        placeholder="Search Text"
        id="user-profiles-wild-card-search"
        value={searchText}
        onChange={e => {
          onSearch(e.target.value);
        }}
        style={{ marginRight: '5px' }}
      />

      {/* SHOW Label Box - changed text-light to text-dark so it pops on the white background label */}
      <div className="input-group-prepend">
        <span className={`input-group-text ${darkMode ? 'bg-yinmn-blue text-dark font-weight-bold' : ''}`}>
          {SHOW}
        </span>
      </div>

      {/* Dropdown Select - Added explicit class styling */}
      <select
        id="active-filter-dropdown"
        onChange={e => {
          onActiveFilter(e.target.value);
        }}
        value={selectText}
        className={`form-control ${darkMode ? 'bg-darkmode-liblack text-light border-secondary' : ''}`}
        style={{ marginBottom: '0px' }}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="paused">Paused</option>
      </select>

      <div className="input-group-append" />
    </div>
  );
}

export default connect(null, { hasPermission })(UserSearchPanel);