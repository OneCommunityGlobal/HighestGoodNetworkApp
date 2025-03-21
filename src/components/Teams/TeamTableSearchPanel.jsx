import hasPermission from 'utils/permissions';
import { boxStyle, boxStyleDark } from 'styles';
import { connect } from 'react-redux';
import { useEffect } from 'react';
import { useRef } from 'react';
import { SEARCH, CREATE_NEW_TEAM } from '../../languages/en/ui';

/**
 * The search panel stateless component for  Teams grid
 */
export function TeamTablesearchPanel(props) {
  const { darkMode } = props;
  const canPostTeam = props.hasPermission('postTeam');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus(); // Programmatically focus the input
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
        <span className="input-group-text">{SEARCH}</span>
      </div>

      <input
        ref={inputRef}
        type="text"
        className="form-control"
        aria-label="Search"
        placeholder="Search Text"
        id="team-profiles-wild-card-search"
        onChange={e => {
          props.onSearch(e.target.value);
        }}
      />
    </div>
  );
}

export default connect(null, { hasPermission })(TeamTablesearchPanel);
