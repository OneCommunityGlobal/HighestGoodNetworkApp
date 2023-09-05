import React from 'react';
import { Button, Col } from 'reactstrap';
import './TeamsAndProjects.css';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';
import hasPermission from '../../../utils/permissions';
import styles from './UserTeamsTable.css';
import { boxStyle } from 'styles';
import { connect } from 'react-redux';

const UserTeamsTable = props => {
  const canAssignTeamToUsers = props.hasPermission('assignTeamToUsers');

  return (
    <div>
      <div className="teamtable-container desktop">
        <div className="container">
          {props.canEditVisibility && (
            <div className="row">
              <Col md="7">
                <span className="teams-span">Visibility</span>
              </Col>
              <Col md="5">
                <ToggleSwitch
                  switchType="visible"
                  state={props.isVisible}
                  handleUserProfile={props.onUserVisibilitySwitch}
                />
              </Col>
            </div>
          )}
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
                {canAssignTeamToUsers ? (
                  props.disabled ? (
                    <div className="div-addteam" title="Please save changes before assign team">
                      <Button className="btn-addteam" color="primary" style={boxStyle} disabled>
                        Assign Team
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="btn-addteam"
                      color="primary"
                      onClick={() => {
                        props.onButtonClick();
                      }}
                      style={boxStyle}
                    >
                      Assign Team
                    </Button>
                  )
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
                  <th style={{ width: '70px' }}>#</th>
                  <th>Team Name</th>
                  {canAssignTeamToUsers ? <th style={{ width: '100px' }}>{}</th> : null}
                </tr>
              )}
            </thead>
            <tbody>
              {props.userTeamsById.length > 0 ? (
                props.userTeamsById.map((team, index) => (
                  <tr key={index} className="tr">
                    <td>{index + 1}</td>
                    <td>{`${team.teamName}`}</td>
                    {props.edit && props.role && (
                      <td>
                        <Button
                          disabled={!canAssignTeamToUsers}
                          color="danger"
                          onClick={e => {
                            props.onDeleteClick(team._id);
                          }}
                          style={boxStyle}
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
      <div className="teamtable-container tablet">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {props.canEditVisibility && (
            <>
              <Col
                md="12"
                style={{
                  backgroundColor: ' #e9ecef',
                  border: '1px solid #ced4da',
                  marginBottom: '10px',
                }}
              >
                <span className="teams-span">Visibility</span>
              </Col>
              <Col
                md="12"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ToggleSwitch
                  switchType="visible"
                  state={props.isVisible}
                  handleUserProfile={props.onUserVisibilitySwitch}
                />
              </Col>
            </>
          )}
          <Col
            md="12"
            style={{
              backgroundColor: ' #e9ecef',
              border: '1px solid #ced4da',
              marginBottom: '10px',
            }}
          >
            <span className="teams-span">Teams</span>
          </Col>
          {props.edit && props.role && (
            <Col
              md="12"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {canAssignTeamToUsers ? (
                props.disabled ? (
                  <div className="div-addteam" title="Please save changes before assign team">
                    <Button className="btn-addteam" color="primary" disabled>
                      Assign Team
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="btn-addteam"
                    color="primary"
                    onClick={() => {
                      props.onButtonClick();
                    }}
                  >
                    Assign Team
                  </Button>
                )
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
                  <th>Team Name</th>
                  {canAssignTeamToUsers ? <th style={{ flex: 2 }}>{}</th> : null}
                </tr>
              )}
            </thead>
            <tbody>
              {props.userTeamsById.length > 0 ? (
                props.userTeamsById.map((team, index) => (
                  <tr key={index} className="tr">
                    <td>{index + 1}</td>
                    <td>{`${team.teamName}`}</td>
                    {props.edit && props.role && (
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Button
                            disabled={!canAssignTeamToUsers}
                            color="danger"
                            onClick={e => {
                              props.onDeleteClick(team._id);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
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
    </div>
  );
};
export default connect(null, { hasPermission })(UserTeamsTable);
