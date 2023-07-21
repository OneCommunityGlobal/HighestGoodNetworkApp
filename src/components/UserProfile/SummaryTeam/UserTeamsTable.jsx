import React, { useState, useEffect } from 'react';
import { Button, Col } from 'reactstrap';
import '../TeamsAndProjects/TeamsAndProjects.css';
import hasPermission from '../../../utils/permissions';
import { useSelector } from 'react-redux';
import styles from './UserTeamsTable.css';

const UserTeamsTable = props => {
  const { roles } = useSelector(state => state.role);
  const userPermissions = useSelector(state => state.auth.user?.permissions?.frontPermissions);

  return (
    <div>
      <div className="teamtable-container desktop">
        <div
          className="container"
          style={{
            width: '100%',
            display: 'flex',
          }}
        >
          <div
            className="row"
            md={props.edit ? '7' : '12'}
            style={{
              backgroundColor: ' #e9ecef',
              border: '1px solid #ced4da',
              marginBottom: '10px',
              width: '100%',
              flexGrow: 1,
            }}
          >
            <span className="teams-span">Summary Teams</span>
          </div>
        </div>
        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          <table className="table table-bordered table-responsive-sm">
            <thead>
              {props.role && (
                <tr>
                  <th>#</th>
                  <th>Summary Team Name</th>
                </tr>
              )}
            </thead>
            <tbody>
              {props.userTeamsById.length > 0 ? (
                props.userTeamsById.map((team, index) => (
                  <tr key={index} className="tr">
                    <td>{index + 1}</td>
                    <td>{`${team.summaryGroupName}`}</td>
                  </tr>
                ))
              ) : (
                <></>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="teamtable-container tablet">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Col
            md={props.edit ? '7' : '12'}
            style={{
              backgroundColor: ' #e9ecef',
              border: '1px solid #ced4da',
              marginBottom: '10px',
            }}
          >
            <span className="teams-span">Summary Teams</span>
          </Col>
          {props.edit && props.role && (
            <Col md="5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {hasPermission(props.role, 'assignTeamToUser', roles, userPermissions) ? (
                <Button
                  className="btn-addteam"
                  color="primary"
                  onClick={() => {
                    props.onButtonClick();
                  }}
                >
                  Assign Team
                </Button>
              ) : (
                <></>
              )}
            </Col>
          )}
        </div>
        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          <table className="table table-bordered">
            <thead>
              {props.role && (
                <tr>
                  <th>#</th>
                  <th>Summary Team Name</th>
                  {hasPermission(props.role, 'assignTeamToUser', roles, userPermissions) ? (
                    <th style={{ flex: 2 }}>{}</th>
                  ) : null}
                </tr>
              )}
            </thead>
            <tbody>
              {props.userTeamsById.length > 0 ? (
                props.userTeamsById.map((team, index) => (
                  <tr key={index} className="tr">
                    <td>{index + 1}</td>
                    <td>{`${team.summaryGroupName}`}</td>
                  </tr>
                ))
              ) : (
                <></>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default UserTeamsTable;
