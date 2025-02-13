import React from 'react';
import './Team.css';
import { DELETE } from '../../languages/en/ui';
import TeamTable from '../Reports/TeamTable';
import hasPermission from 'utils/permissions';
import { boxStyle } from 'styles';
import { connect, useSelector } from 'react-redux';

export const Team = props => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const canDeleteTeam = props.hasPermission('deleteTeam');
  const canPutTeam = props.hasPermission('putTeam');

  return (
    <tr className={`teams__tr`} id={`tr_${props.teamId}`}>
      <th className="teams__order--input" scope="row">
        <div>{props.index + 1}</div>
      </th>
      <td>{props.name}</td>
      <td
        className="teams__active--input"
        onClick={e => {
          canDeleteTeam || canPutTeam
            ? props.onStatusClick(props.name, props.teamId, props.active, props.teamCode)
            : null;
        }}
        // style={boxStyle}
        data-testid='active-marker'
      >
        {props.active ? (
          <div className="isActive">
            <i className="fa fa-circle" aria-hidden="true" />
          </div>
        ) : (
          <div className="isNotActive">
            <i className="fa fa-circle" aria-hidden="true" color='#dee2e6'/>
          </div>
        )}
      </td>
      <td className="centered-cell">
        <button style={darkMode ? {} : boxStyle}
          type="button"
          className="btn btn-outline-info"
          onClick={e => {
            props.onMembersClick(props.teamId, props.name, props.teamCode);
          }}
          data-testid='members-btn'
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
};
export default connect(null, { hasPermission })(Team);
