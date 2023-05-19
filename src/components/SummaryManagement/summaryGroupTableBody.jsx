import React from 'react';
import './summarygroup.css';
import { DELETE, EDIT } from '../../languages/en/ui';

const summaryGroupTableBody = props => {
  return (
    <tr className="summarygroup__tr" id={`tr_${props.summaryGroupId}`}>
      <th className="summarygroup__order--input" scope="row">
        <div>{props.index + 1}</div>
      </th>
      <td>{props.name}</td>
      <td
        className="summarygroup__active--input"
        onClick={e => {
          //</tr>hasPermission(props.requestorRole, 'editDeleteTeam', props.roles, props.userPermissions)
          props.onStatusClick(props.name, props.summaryGroupId, props.active);
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
            props.onMembersClick(props.summaryGroupId, props.name);
          }}
        >
          <i className="fa fa-users" aria-hidden="true" />
        </button>
      </td>
      <td>
        <button
          type="button"
          className="btn btn-outline-info"
          onClick={e => {
            props.onSummaryReciverClick(props.summaryGroupId, props.name);
          }}
        >
          <i className="fa fa-users" aria-hidden="true" />
        </button>
      </td>
      <td>
        <span className="usermanagement-actions-cell">
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() => {
              props.onEditTeam(props.name, props.summaryGroupId, props.active);
            }}
          >
            {EDIT}
          </button>
        </span>
        <span className="usermanagement-actions-cell">
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={() => {
              props.onDeleteClick(props.name, props.summaryGroupId, props.active);
            }}
          >
            {DELETE}
          </button>
        </span>
      </td>
    </tr>
  );
};
export default summaryGroupTableBody;
