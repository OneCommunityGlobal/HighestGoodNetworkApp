import React from 'react';
import './Team.css';
import { DELETE } from '../../languages/en/ui';
import TeamTable from '../Reports/TeamTable';
import hasPermission from 'utils/permissions';
import { boxStyle } from 'styles';
import { connect } from 'react-redux';

export const Team = props => {
  const canDeleteTeam = props.hasPermission('deleteTeam');
  const canPutTeam = props.hasPermission('putTeam');

  return (
    <tr className="teams__tr" id={`tr_${props.teamId}`}>
      <th className="teams__order--input" scope="row">
        <div>{props.index + 1}</div>
      </th>
      <td>{props.name}</td>
      <td
        className="teams__active--input"
        onClick={e => {
          canDeleteTeam || canPutTeam
            ? props.onStatusClick(props.name, props.teamId, props.active)
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
            <i className="fa fa-circle-o" aria-hidden="true" />
          </div>
        )}
      </td>
      <td style={boxStyle} className="centered-cell">
        <button
          type="button"
          className="btn btn-outline-info"
          onClick={e => {
            props.onMembersClick(props.teamId, props.name);
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
                props.onEditTeam(props.name, props.teamId, props.active);
              }}
              style={boxStyle}
            >
              Edit
            </button>
          </span>
          <span className="usermanagement-actions-cell">
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => {
                props.onDeleteClick(props.name, props.teamId, props.active);
              }}
              style={boxStyle}
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
