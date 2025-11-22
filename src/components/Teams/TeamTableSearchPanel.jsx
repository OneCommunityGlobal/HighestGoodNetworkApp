/* eslint-disable react/destructuring-assignment */
import { connect } from 'react-redux';
import { useEffect, useRef } from 'react';
import { boxStyle, boxStyleDark } from '~/styles';
import hasPermission from '~/utils/permissions';
import { SEARCH, CREATE_NEW_TEAM } from '../../languages/en/ui';

/**
 * The search panel stateless component for Teams grid
 */
export function TeamTableSearchPanelBase(props) {
  const { darkMode } = props;
  const canPostTeam = props.hasPermission('postTeam');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="input-group" id="new_team">
      {canPostTeam && (
        <button
          type="button"
          className="btn btn-info"
          onClick={() => {
            props.onCreateNewTeamClick();
          }}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          {CREATE_NEW_TEAM}
        </button>
      )}
      <div className="input-group-prepend" style={{ marginLeft: '10px' }}>
        <span className={`input-group-text ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}>
          {SEARCH}
        </span>
      </div>
      <input
        ref={inputRef}
        type="text"
        className={`form-control ${darkMode ? 'bg-darkmode-liblack text-light' : ''}`}
        aria-label="Search"
        placeholder="Search Teams"
        id="team-profiles-wild-card-search"
        value={props.searchText}
        onChange={e => {
          props.onSearch(e.target.value);
        }}
      />
    </div>
  );
}
export default connect(null, { hasPermission })(TeamTableSearchPanelBase);
