import React from 'react';
import { Button, Col } from 'reactstrap';
import './TeamsAndProjects.css';
import hasPermission from '../../../utils/permissions';
import { useSelector } from 'react-redux';

const UserTeamsTable = props => {
  const { roles } = useSelector(state => state.role);
  const userPermissions = useSelector(state => state.auth.user?.permissions?.frontPermissions);
  return (
    // debugger;
    <div className="teamtable-container">
      <div className="container">
        <div className="row">
          <Col
            md={props.edit ? '7' : '12'}
            style={{
              backgroundColor: ' #e9ecef',
              border: '1px solid #ced4da',
              marginBottom: '10px',
            }}
          >
            <span className="teams-span">Teams</span>
          </Col>
          {props.edit && props.role && (
            <Col md="5">
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
      </div>
      <div style={{ maxHeight: '300px', overflow: 'auto' }}>
        <table className="table table-bordered table-responsive-sm">
          <thead>
            {props.role && (
              <tr>
                <th>#</th>
                <th>Team Name</th>
                {hasPermission(props.role, 'assignTeamToUser', roles, userPermissions) ? (
                  <th>{}</th>
                ) : null}
              </tr>
            )}
          </thead>
          <tbody>
            {props.userTeamsById.length > 0 ? (
              props.userTeamsById.map((team, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{`${team.teamName}`}</td>
                  {props.edit && props.role && (
                    <td>
                      <Button
                        disabled={
                          !hasPermission(props.role, 'assignTeamToUser', roles, userPermissions)
                        }
                        color="danger"
                        onClick={e => {
                          props.onDeleteClick(team._id);
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <></>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default UserTeamsTable;
