import { React, useState, useEffect, useRef } from 'react';
import {
  Button,
  Col,
  Tooltip,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from 'reactstrap';
import './TeamsAndProjects.css';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';
import hasPermission from '../../../utils/permissions';
import styles from './UserTeamsTable.css';
import { boxStyle, boxStyleDark } from 'styles';
import { connect } from 'react-redux';
import { AutoCompleteTeamCode } from './AutoCompleteTeamCode';

const UserTeamsTable = props => {
  const { darkMode } = props;

  const [tooltipOpen, setTooltip] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);

  const [autoComplete, setAutoComplete] = useState(false);

  const [innerWidth, setInnerWidth] = useState();

  const [arrayInputAutoComplete, setArrayInputAutoComplete] = useState([]);

  const [isOpenModalTeamCode, setIsOpenModalTeamCode] = useState(false);

  const [teamCode, setTeamCode] = useState(
    props.userProfile ? props.userProfile.teamCode : props.teamCode,
  );

  const refDropdown = useRef();

  const canAssignTeamToUsers = props.hasPermission('assignTeamToUsers');
  const fullCodeRegex = /^([a-zA-Z]-[a-zA-Z]{3}|[a-zA-Z]{5})$/;
  const toggleTooltip = () => setTooltip(!tooltipOpen);

  const handleCodeChange = (e, autoComplete) => {
    //prettier-ignore
    if( e === true ) { setIsOpenModalTeamCode(true); return;}
    //prettier-ignore
    else isOpenModalTeamCode && autoComplete && setIsOpenModalTeamCode(false)

    setAutoComplete(autoComplete);
    const regexTest = fullCodeRegex.test(autoComplete ? e : e.target.value);
    if (regexTest) {
      props.setCodeValid(true);
      setTeamCode(autoComplete ? e : e.target.value);
      if (props.userProfile) {
        props.setUserProfile({ ...props.userProfile, teamCode: autoComplete ? e : e.target.value });
      } else {
        props.onAssignTeamCode(autoComplete ? e : e.target.value);
      }
    } else {
      setTeamCode(autoComplete ? e : e.target.value);
      props.setCodeValid(false);
    }
    autoComplete ? setShowDropdown(false) : null;
    autoComplete = false;
  };

  useEffect(() => {
    if (teamCode !== '' && !props.isLoading && autoComplete === undefined) {
      const isMatchingSearch = props.inputAutoComplete.filter(item =>
        filterInputAutoComplete(item).includes(filterInputAutoComplete(teamCode)),
      );
      setArrayInputAutoComplete(isMatchingSearch);
    } else {
      setArrayInputAutoComplete(props.inputAutoComplete);
    }
  }, [teamCode, props.inputAutoComplete, autoComplete, isOpenModalTeamCode]);

  const filterInputAutoComplete = result => {
    return result
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '');
  };
  useEffect(() => {
    setInnerWidth(window.innerWidth);
  }, [window.innerWidth]);

  return (
    <div>
      {innerWidth >= 1025 ? (
        <div className={`teamtable-container desktop ${darkMode ? 'bg-yinmn-blue' : ''}`}>
          <div
            className="container"
            style={{ paddingLeft: '4px', paddingRight: '4px', marginBottom: '2rem' }}
          >
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
                    darkMode={darkMode}
                  />
                </Col>
              </div>
            )}
            <div className="row" style={{ margin: '0 auto' }}>
              <Col
                md={canAssignTeamToUsers ? '7' : '10'}
                style={{
                  backgroundColor: darkMode ? '#1C2541' : '#e9ecef',
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
                        style={darkMode ? {} : boxStyle}
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
                      style={darkMode ? {} : boxStyle}
                    >
                      Assign Team
                    </Button>
                  )}
                </Col>
              )}
              <Col md="2" style={{ padding: '0' }}>
                {props.canEditTeamCode ? (
                  <>
                    {!isOpenModalTeamCode ? (
                      <AutoCompleteTeamCode
                        refDropdown={refDropdown}
                        teamCode={teamCode}
                        showDropdown={showDropdown}
                        handleCodeChange={handleCodeChange}
                        setShowDropdown={setShowDropdown}
                        arrayInputAutoComplete={arrayInputAutoComplete}
                        inputAutoStatus={props.inputAutoStatus}
                        isLoading={props.isLoading}
                        fetchTeamCodeAllUsers={props.fetchTeamCodeAllUsers}
                        darkMode={darkMode}
                        isOpenModalTeamCode={isOpenModalTeamCode}
                        setIsOpenModalTeamCode={setIsOpenModalTeamCode}
                      />
                    ) : (
                      <>
                        <Input
                          value={teamCode}
                          placeholder="X-XXX"
                          style={
                            darkMode
                              ? {
                                  backgroundColor: '#1c2541',
                                  color: '#fff',
                                  outline: 'none',
                                  border: 'none',
                                }
                              : null
                          }
                        />

                        <Modal
                          isOpen={isOpenModalTeamCode}
                          toggle={() => setIsOpenModalTeamCode(false)}
                          className={darkMode ? 'dark-mode' : ''}
                        >
                          <ModalHeader
                            toggle={() => setIsOpenModalTeamCode(false)}
                            className={darkMode && `bg-space-cadet border-white text-light`}
                          ></ModalHeader>
                          <ModalBody className={darkMode && `bg-yinmn-blue`}>
                            <AutoCompleteTeamCode
                              refDropdown={refDropdown}
                              teamCode={teamCode}
                              showDropdown={showDropdown}
                              handleCodeChange={handleCodeChange}
                              setShowDropdown={setShowDropdown}
                              arrayInputAutoComplete={arrayInputAutoComplete}
                              inputAutoStatus={props.inputAutoStatus}
                              isLoading={props.isLoading}
                              fetchTeamCodeAllUsers={props.fetchTeamCodeAllUsers}
                              darkMode={darkMode}
                              isOpenModalTeamCode={isOpenModalTeamCode}
                              setIsOpenModalTeamCode={setIsOpenModalTeamCode}
                            />
                          </ModalBody>
                        </Modal>
                      </>
                    )}
                  </>
                ) : (
                  <div style={{ paddingTop: '6px', textAlign: 'center' }}>
                    {teamCode == '' ? 'No assigned team code' : teamCode}
                  </div>
                )}
              </Col>
            </div>
          </div>
          <div style={{ maxHeight: '300px', overflow: 'auto', margin: '4px' }}>
            <table
              className={`table table-bordered table-responsive-sm ${darkMode ? 'text-light' : ''}`}
            >
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
                            style={darkMode ? boxStyleDark : boxStyle}
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
        <div className={`teamtable-container tablet  ${darkMode ? 'bg-yinmn-blue' : ''}`}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {props.canEditVisibility && (
              <>
                <Col
                  md="12"
                  style={{
                    backgroundColor: darkMode ? '#1C2541' : '#e9ecef',
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
                    darkMode={darkMode}
                  />
                </Col>
              </>
            )}
            <div className="row" style={{ paddingLeft: '30px' }}>
              <Col
                md="9"
                xs="12"
                style={{
                  backgroundColor: darkMode ? '#1C2541' : '#e9ecef',
                  border: '1px solid #ced4da',
                  marginBottom: '10px',
                  height: '10%',
                }}
              >
                <span className="teams-span">Teams</span>
              </Col>
              <Col md="3" xs="12" style={{ padding: '0', marginBottom: '10px' }}>
                {props.canEditTeamCode ? (
                  <AutoCompleteTeamCode
                    refDropdown={refDropdown}
                    teamCode={teamCode}
                    showDropdown={showDropdown}
                    handleCodeChange={handleCodeChange}
                    setShowDropdown={setShowDropdown}
                    arrayInputAutoComplete={arrayInputAutoComplete}
                    inputAutoStatus={props.inputAutoStatus}
                    isLoading={props.isLoading}
                    fetchTeamCodeAllUsers={props.fetchTeamCodeAllUsers}
                  />
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
            <table className={`table table-bordered ${darkMode ? 'text-light' : ''}`}>
              <thead>
                {props.role && (
                  <tr>
                    <th className={darkMode ? 'bg-space-cadet' : ''}>#</th>
                    <th className={darkMode ? 'bg-space-cadet' : ''}>Team Name</th>
                    {canAssignTeamToUsers ? (
                      <th style={{ flex: 2 }} className={darkMode ? 'bg-space-cadet' : ''}>
                        {}
                      </th>
                    ) : null}
                  </tr>
                )}
              </thead>
              <tbody className={darkMode ? 'text-light' : ''}>
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
