import React from 'react';
import './Team.css';
import { DELETE } from '../../languages/en/ui';
import TeamTable from '../Reports/TeamTable';
import hasPermission from 'utils/permissions';

const Team = props => (
  <tr className="teams__tr" id={`tr_${props.teamId}`}>
    <th className="teams__order--input" scope="row">
      <div>{props.index + 1}</div>
    </th>
    <td>{props.name}</td>
    <td
      className="teams__active--input"
      onClick={e => {
        hasPermission(props.requestorRole, 'editDeleteTeam', props.roles, props.userPermissions)
          ? props.onStatusClick(props.name, props.teamId, props.active)
          : null;
      }}
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
    <td>
      <button
        type="button"
        className="btn btn-outline-info"
        onClick={e => {
          props.onMembersClick(props.teamId, props.name);
        }}
      >
        <i className="fa fa-users" aria-hidden="true" />
      </button>
    </td>
    {hasPermission(props.requestorRole, 'editDeleteTeam', props.roles, props.userPermissions) && (
      <td>
        <span className="usermanagement-actions-cell">
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() => {
              props.onEditTeam(props.name, props.teamId, props.active);
            }}
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
          >
            {DELETE}
          </button>
        </span>
      </td>
    )}
  </tr>
);
export default Team;
