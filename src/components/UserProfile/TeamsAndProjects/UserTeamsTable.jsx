import { React, useState } from 'react';
import { Button, Input, Col, Tooltip } from 'reactstrap';
import './TeamsAndProjects.css';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';
import hasPermission from '../../../utils/permissions';
import styles from './UserTeamsTable.css';
import { boxStyle } from 'styles';
import { connect } from 'react-redux';

const UserTeamsTable = props => {
  const [tooltipOpen, setTooltip] = useState(false);
  const [teamCode, setTeamCode] = useState(props.userProfile? props.userProfile.teamCode: props.teamCode);

  const canAssignTeamToUsers = props.hasPermission('assignTeamToUsers');
  const fullCodeRegex = /^([a-zA-Z]-[a-zA-Z]{3}|[a-zA-Z]{5})$/;
  const toggleTooltip = () => setTooltip(!tooltipOpen);

  const handleCodeChange = e => {
    let value = e.target.value;
    
    const regexTest = fullCodeRegex.test(value);
    if (regexTest) {
      props.setCodeValid(true);
      setTeamCode(value);
      if (props.userProfile) {
        props.setUserProfile({ ...props.userProfile, teamCode: value });
      } else {
        props.onAssignTeamCode(value);
      }
    } else {
      setTeamCode(value);
      props.setCodeValid(false);
    }
  };

  return (
    <div>
      <div className="teamtable-container desktop">
        <div className="container" style={{paddingLeft: '4px', paddingRight: '4px'}}>
          {props.canEditVisibility && (
            <div className="row" >
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
          <div className="row" style={{ margin: '0 auto'}}>
            <Col
              md={canAssignTeamToUsers ? '7' : '10'}
              style={{
                backgroundColor: ' #e9ecef',
                border: '1px solid #ced4da',
                marginBottom: '10px',
              }}
            >
              <span className="teams-span">Teams</span>
            </Col>
            {props.edit && props.role && canAssignTeamToUsers && (
              <Col md="3" style={{padding: '0'}}>
                {props.disabled ? (
                  <>
                    <Tooltip placement="bottom" isOpen={tooltipOpen} target="btn-assignteam" toggle={toggleTooltip}>
                      Please save changes before assign team
                    </Tooltip>
                    <Button className="btn-addteam" id='btn-assignteam' color="primary" style={boxStyle} disabled>
                      Assign Team
                    </Button>
                  </>
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
                )}
              </Col>
            )}
            <Col md="2" style={{padding: '0'}}>
              {props.canEditTeamCode ? (
                <Input
                  id="teamCode"
                  value={teamCode}
                  onChange={handleCodeChange}
                  placeholder="X-XXX"
                />
              ) : (
                <div style={{paddingTop: '6px', textAlign: 'center'}}>
                  {teamCode == ''? "No assigned team code": teamCode}
                </div>
              )}
            </Col>
          </div>
        </div>
        <div style={{ maxHeight: '300px', overflow: 'auto', margin: '4px' }}>
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
                      <td style={{ textAlign: 'center'}}>
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
          <div className="row" style={{ paddingLeft: '30px' }}>
            <Col
              md="9"
              xs="12"
              style={{
                backgroundColor: ' #e9ecef',
                border: '1px solid #ced4da',
                marginBottom: '10px',
              }}
            >
              <span className="teams-span">Teams</span>
            </Col>
            <Col md="3" xs="12" style={{ padding: '0', marginBottom: '10px' }}>
                {props.canEditTeamCode ? (
                  <Input
                    id="teamCode"
                    value={teamCode}
                    onChange={handleCodeChange}
                    placeholder="X-XXX"
                  />
                ) : (
                  <div style={{paddingTop: '6px', textAlign: 'center'}}>
                    {teamCode == ''? "No assigned team code": teamCode}
                  </div>
                )}
            </Col>
          </div>
          {props.edit && props.role && (
            <Col
              md="12"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {canAssignTeamToUsers ? (
                props.disabled ? (
                  <Button className="btn-addteam" color="primary" style={boxStyle} disabled>
                    Assign Team
                  </Button>
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
