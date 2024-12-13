import './Team.css';
import hasPermission from 'utils/permissions';
import { boxStyle } from 'styles';
import { connect, useSelector } from 'react-redux';
import { DELETE } from '../../languages/en/ui';

export function Team(props) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const canDeleteTeam = props.hasPermission('deleteTeam');
  const canPutTeam = props.hasPermission('putTeam');

  return (
    <tr className="teams__tr" id={`tr_${props.teamId}`}>
      <th className="teams__order--input" scope="row">
        <div>{props.index + 1}</div>
      </th>
      <td>{props.name}</td>
      <td className="teams__active--input">
        <button
          data-testid="active-marker"
          type="button"
          onClick={() => {
            if (canDeleteTeam || canPutTeam) {
              props.onStatusClick(props.name, props.teamId, props.active, props.teamCode);
            }
          }}
          style={{
            all: 'unset', // Reset default button styles
            cursor: 'pointer',
            width: '100%',
            height: '100%',
          }}
          aria-label={`Change status for team ${props.name}`}
        >
          {/* Your content or indicator goes here */}
        </button>
      </td>
      <td className="centered-cell">
        <button
          style={darkMode ? {} : boxStyle}
          type="button"
          className="btn btn-outline-info"
          onClick={() => {
            props.onMembersClick(props.teamId, props.name, props.teamCode);
          }}
          data-testid="members-btn"
        >
          <i className="fa fa-users" aria-hidden="true" />
        </button>
      </td>
      {(canDeleteTeam || canPutTeam) && (
        <td>
          <span className="usermanagement-actions-cell">
            <button
              type="button"
              className="btn btn-outline-success"
              onClick={() => {
                props.onEditTeam(props.name, props.teamId, props.active, props.teamCode);
              }}
              style={darkMode ? {} : boxStyle}
            >
              Edit
            </button>
          </span>
          <span className="usermanagement-actions-cell">
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => {
                props.onDeleteClick(props.name, props.teamId, props.active, props.teamCode);
              }}
              style={darkMode ? {} : boxStyle}
            >
              {DELETE}
            </button>
          </span>
        </td>
      )}
    </tr>
  );
}
export default connect(null, { hasPermission })(Team);
