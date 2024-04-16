import { React, useState, useEffect, Fragment, useRef } from 'react';
import { Button, Input, Col, Tooltip, ListGroup, ListGroupItem, Spinner } from 'reactstrap';
import './TeamsAndProjects.css';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';
import hasPermission from '../../../utils/permissions';
import styles from './UserTeamsTable.css';
import { boxStyle } from 'styles';
import { connect } from 'react-redux';

const UserTeamsTable = props => {
  const [tooltipOpen, setTooltip] = useState(false);

  const [showDropdown, setShowDropdown] = useState(true);

  const [innerWidth, setInnerWidth] = useState();

  const [arrayInputAutoComplete, setArrayInputAutoComplete] = useState([]);

  const [testNew, setTestNew] = useState('');

  const [teamCode, setTeamCode] = useState(
    props.userProfile ? props.userProfile.teamCode : props.teamCode,
  );

  const refDropdown = useRef();

  useEffect(() => {
    const handleClickOutside = event =>
      refDropdown.current && !refDropdown.current.contains(event.target)
        ? setShowDropdown(false)
        : null;
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [refDropdown]);

  const canAssignTeamToUsers = props.hasPermission('assignTeamToUsers');
  const fullCodeRegex = /^([a-zA-Z]-[a-zA-Z]{3}|[a-zA-Z]{5})$/;
  const toggleTooltip = () => setTooltip(!tooltipOpen);

  let test = false;

  const handleCodeChange = e => {
    !test ? setTestNew(e.target.value) : null;
    const regexTest = fullCodeRegex.test(test ? e : e.target.value);
    if (regexTest) {
      props.setCodeValid(true);
      setTeamCode(test ? e : e.target.value);
      if (props.userProfile) {
        props.setUserProfile({ ...props.userProfile, teamCode: test ? e : e.target.value });
      } else {
        props.onAssignTeamCode(test ? e : e.target.value);
      }
    } else {
      setTeamCode(test ? e : e.target.value);
      props.setCodeValid(false);
    }
    test ? setShowDropdown(false) : null;
    test = false;
  };

  useEffect(() => {
    if (testNew !== '') {
      const isMatchingSearch = props.inputAutoComplete.filter(item =>
        item.toLowerCase().includes(testNew.toLowerCase()),
      );
      setArrayInputAutoComplete(isMatchingSearch);
    } else {
      setArrayInputAutoComplete(props.inputAutoComplete);
    }
  }, [testNew, props.inputAutoComplete]);

  useEffect(() => {
    setInnerWidth(window.innerWidth);
  }, [window.innerWidth]);

  return (
    <div>
      {innerWidth >= 1025 ? (
        <div className="teamtable-container desktop">
          <div className="container" style={{ paddingLeft: '4px', paddingRight: '4px' }}>
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
            <div className="row" style={{ margin: '0 auto' }}>
              <Col
                md={canAssignTeamToUsers ? '7' : '10'}
                style={{
                  backgroundColor: ' #e9ecef',
                  border: '1px solid #ced4da',
                  marginBottom: '10px',
                  height: '10%',
                }}
              >
                <span className="teams-span">Teams</span>
              </Col>
              {props.edit && props.role && canAssignTeamToUsers && (
                <Col md="3" style={{ padding: '0' }}>
                  {props.disabled ? (
                    <>
                      <Tooltip
                        placement="bottom"
                        isOpen={tooltipOpen}
                        target="btn-assignteam"
                        toggle={toggleTooltip}
                      >
                        Please save changes before assign team
                      </Tooltip>
                      <Button
                        className="btn-addteam"
                        id="btn-assignteam"
                        color="primary"
                        style={boxStyle}
                        disabled
                      >
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
              <Col md="2" style={{ padding: '0' }}>
                {props.canEditTeamCode ? (
                  <section ref={refDropdown}>
                    <Input
                      id="teamCode"
                      value={teamCode}
                      onChange={handleCodeChange}
                      placeholder="X-XXX"
                      onFocus={() => setShowDropdown(true)}
                    />

                    {showDropdown ? (
                      <div
                        style={
                          arrayInputAutoComplete.length <= 3 && props.inputAutoStatus === 200
                            ? { height: 'auto', width: 'auto' }
                            : { height: '6rem', width: 'auto' }
                        }
                        className=" overflow-auto mb-2"
                      >
                        {props.inputAutoStatus === 200 ? (
                          arrayInputAutoComplete.length === 0 ? (
                            <p
                              className="m-0 pb-1 pt-1 d-flex justify-content-center  align-items-center  list-group-item-action"
                              style={{
                                border: '1px solid #ccc',
                                backgroundColor: '#fff',
                              }}
                            >
                              No options
                            </p>
                          ) : (
                            arrayInputAutoComplete.map(item => {
                              return (
                                <div key={item}>
                                  <p
                                    className="m-0 pb-1 pt-1 d-flex justify-content-center  align-items-center  list-group-item-action"
                                    style={{
                                      cursor: 'pointer',
                                      border: '1px solid #ccc',
                                      backgroundColor: '#fff',
                                    }}
                                    onClick={() => handleCodeChange(item, (test = true))}
                                  >
                                    {item}
                                  </p>
                                </div>
                              );
                            })
                          )
                        ) : (
                          <section
                            className="h-100 d-flex justify-content-center align-items-center "
                            style={{
                              border: '1px solid #ccc',
                              backgroundColor: '#fff',
                              borderBottomRightRadius: '10px',
                              borderBottomLeftRadius: '10px',
                            }}
                          >
                            <Spinner color="primary"></Spinner>
                          </section>
                        )}
                      </div>
                    ) : null}
                  </section>
                ) : (
                  <div style={{ paddingTop: '6px', textAlign: 'center' }}>
                    {teamCode == '' ? 'No assigned team code' : teamCode}
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
                    <th>#</th>
                    {canAssignTeamToUsers ? <th style={{ width: '100px' }}>Team Name</th> : null}
                  </tr>
                )}
              </thead>
              <tbody>
                {props.userTeamsById.length > 0 ? (
                  props.userTeamsById.map((team, index) => (
                    <tr key={index} className="tr">
                      <td style={{ textAlign: 'center', width: '10%' }}>{index + 1}</td>
                      <td>{`${team.teamName}`}</td>
                      {props.edit && props.role && (
                        <td style={{ textAlign: 'center', width: '20%' }}>
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
      ) : (
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
                  height: '10%',
                }}
              >
                <span className="teams-span">Teams</span>
              </Col>
              <Col md="3" xs="12" style={{ padding: '0', marginBottom: '10px' }}>
                {props.canEditTeamCode ? (
                  <section ref={refDropdown}>
                    <Input
                      id="teamCode"
                      value={teamCode}
                      onChange={handleCodeChange}
                      placeholder="X-XXX"
                      onFocus={() => setShowDropdown(true)}
                    />

                    {showDropdown ? (
                      <div
                        style={
                          arrayInputAutoComplete.length <= 3 && props.inputAutoStatus === 200
                            ? { height: 'auto', width: 'auto' }
                            : { height: '8rem', width: 'auto' }
                        }
                        className=" overflow-auto mb-2 "
                      >
                        {props.inputAutoStatus === 200 ? (
                          arrayInputAutoComplete.length === 0 ? (
                            <p
                              className="m-0 pb-1 pt-1 d-flex justify-content-center  align-items-center  list-group-item-action"
                              style={{
                                border: '1px solid #ccc',
                                backgroundColor: '#fff',
                              }}
                            >
                              No options
                            </p>
                          ) : (
                            arrayInputAutoComplete.map(item => {
                              return (
                                <div key={item}>
                                  <p
                                    className="m-0 pb-1 pt-1 d-flex justify-content-center  align-items-center  list-group-item-action"
                                    style={{
                                      cursor: 'pointer',
                                      border: '1px solid #ccc',
                                      backgroundColor: '#fff',
                                    }}
                                    onClick={() => handleCodeChange(item, (test = true))}
                                  >
                                    {item}
                                  </p>
                                </div>
                              );
                            })
                          )
                        ) : (
                          <section
                            className="h-100 d-flex justify-content-center align-items-center "
                            style={{
                              border: '1px solid #ccc',
                              backgroundColor: '#fff',
                              borderBottomRightRadius: '10px',
                              borderBottomLeftRadius: '10px',
                            }}
                          >
                            <Spinner color="primary"></Spinner>
                          </section>
                        )}
                      </div>
                    ) : null}
                  </section>
                ) : (
                  <div style={{ paddingTop: '6px', textAlign: 'center' }}>
                    {teamCode == '' ? 'No assigned team code' : teamCode}
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
      )}
    </div>
  );
};
export default connect(null, { hasPermission })(UserTeamsTable);
