import './Team.css';
import hasPermission from 'utils/permissions';
import { boxStyle } from 'styles';
import { connect, useSelector } from 'react-redux';
import { DELETE } from '../../languages/en/ui';

export function Team(props) {
  const darkMode = useSelector((state) => state.theme.darkMode);
  const canDeleteTeam = props.hasPermission('deleteTeam');
  const canPutTeam = props.hasPermission('putTeam');

  const handleStatusClick = () => {
    if (canDeleteTeam || canPutTeam) {
      props.onStatusClick(props.name, props.teamId, props.active, props.teamCode);
    }
  };

  const handleMembersClick = () => {
    props.onMembersClick(props.teamId, props.name, props.teamCode);
  };

  return (
    <tr className="teams__tr" id={`tr_${props.teamId}`}>
      <th className="teams__order--input" scope="row">
        <div>{props.index + 1}</div>
      </th>
      <td>{props.name}</td>
      <td className="teams__active--input" data-testid="active-marker">
        <button
          type="button" // Added explicit type attribute
          onClick={handleStatusClick}
          style={{ border: 'none', background: 'none', padding: 0, margin: 0 }}
          aria-label={`Set team ${props.active ? 'inactive' : 'active'}`}
        >
          {props.active ? (
            <div className="isActive">
              <i className="fa fa-circle" aria-hidden="true" />
            </div>
          ) : (
            <div className="isNotActive">
              <i className="fa fa-circle" aria-hidden="true" color="#dee2e6" />
            </div>
          )}
        </button>
      </td>
      <td className="centered-cell">
        <button
          style={darkMode ? {} : boxStyle}
          type="button"
          className="btn btn-outline-info"
          onClick={handleMembersClick}
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
