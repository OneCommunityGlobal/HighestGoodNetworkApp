/* eslint-disable react/destructuring-assignment */
import { connect } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { boxStyle, boxStyleDark } from '../../styles';
import hasPermission from '../../utils/permissions';
import { SEARCH, CREATE_NEW_TEAM } from '../../languages/en/ui';
import styles from './TeamTableSearchPanel.module.css';
/**
 * The search panel stateless component for  Teams grid
 */
export function TeamTableSearchPanelBase(props) {
  const { darkMode } = props;

  const [canPostTeam, setCanPostTeam] = useState(props.hasPermission('postTeam'));

  // prettier-ignore
  if (canPostTeam === false) setTimeout(() => setCanPostTeam(props.hasPermission('postTeam')), 1000);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus(); // Programmatically focus the input
  }, []);
  return (
    <div className="input-group" id="new_team">
      <div className="input-group-prepend" style={{ marginLeft: '10px' }}>
        <span className={`input-group-text ${darkMode ? styles.searchLabelDark : ''}`}>
          {SEARCH}
        </span>
      </div>
      <input
        ref={inputRef}
        type="text"
        className={`form-control ${darkMode ? styles.searchInputDark : ''}`}
        aria-label="Search"
        placeholder="Search Text"
        id="team-profiles-wild-card-search"
        onChange={e => {
          props.onSearch(e.target.value);
        }}
      />
      {canPostTeam && (
        <button
          type="button"
          className="btn btn-info ml-2"
          onClick={() => {
            props.onCreateNewTeamClick();
          }}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          {CREATE_NEW_TEAM}
        </button>
      )}
    </div>
  );
}
export default connect(null, { hasPermission })(TeamTableSearchPanelBase);
