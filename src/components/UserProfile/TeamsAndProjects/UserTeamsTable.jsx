import { React, useState, useEffect, useRef } from 'react';
import { Button, Col, Tooltip } from 'reactstrap';
import './TeamsAndProjects.css';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';
import hasPermission from '../../../utils/permissions';
import styles from './UserTeamsTable.css';
import { boxStyle, boxStyleDark } from 'styles';
import { connect } from 'react-redux';
import { AutoCompleteTeamCode } from './AutoCompleteTeamCode';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import { toast } from 'react-toastify';

const UserTeamsTable = props => {
  const { darkMode } = props;

  const [tooltipOpen, setTooltip] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);

  const [innerWidth, setInnerWidth] = useState();

  const [arrayInputAutoComplete, setArrayInputAutoComplete] = useState(props.inputAutoComplete);

  const [teamCode, setTeamCode] = useState(
    props.userProfile ? props.userProfile.teamCode : props.teamCode,
  );

  const refDropdown = useRef();

  const refInput = useRef(null);

  const canAssignTeamToUsers = props.hasPermission('assignTeamToUsers');
  const fullCodeRegex = /^.{5,7}$/;
  const toggleTooltip = () => setTooltip(!tooltipOpen);

  const handleCodeChange = async (e, autoComplete) => {
    const isUpdateAutoComplete = validationUpdateAutoComplete(autoComplete ? e : e.target.value);
    const regexTest = fullCodeRegex.test(autoComplete ? e : e.target.value);
    refInput.current = autoComplete ? e : e.target.value;
    if (regexTest) {
      props.setCodeValid(true);
      setTeamCode(autoComplete ? e : e.target.value);
      if (props.userProfile) {
        try {
          const url = ENDPOINTS.USER_PROFILE_PROPERTY(props.userProfile._id);
          await axios.patch(url, { key: 'teamCode', value: refInput.current });
          toast.success('Team code updated!');
          setTimeout(async () => {
            //prettier-ignore
            if(isUpdateAutoComplete.length === 0){
              await props.fetchTeamCodeAllUsers();
              toast.info('Auto complete updated!')
            }
          }, 2000);
          setArrayInputAutoComplete(props.inputAutoComplete);
        } catch {
          toast.error('It is not possible to save the team code.');
        }
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

  const validationUpdateAutoComplete = e => {
    if (e !== '' && !props.isLoading) {
      const isMatchingSearch = props.inputAutoComplete.filter(item =>
        filterInputAutoComplete(item).includes(filterInputAutoComplete(e)),
      );
      setArrayInputAutoComplete(isMatchingSearch);
      //prettier-ignore
      return isMatchingSearch.filter(item => filterInputAutoComplete(item) === filterInputAutoComplete(e));
    } else {
      setArrayInputAutoComplete(props.inputAutoComplete);
    }
  };
  //prettier-ignore
  useEffect(() => {setArrayInputAutoComplete(props.inputAutoComplete)}, [props.inputAutoStatus]);

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
        <div className={`${darkMode ? 'bg-yinmn-blue' : ''}`}>
          <div className="container">
            {props.canEditVisibility && (
              <div className="row ml-1">
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
                    isMobile={false}
                    refInput={refInput}
                  />
                ) : (
                  <div style={{ fontSize: '12px', textAlign: 'center' }}>
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
              <thead className={darkMode ? 'bg-space-cadet' : ''}>
                {props.role && (
                  <tr style={{ textAlign: 'center' }}>
                    <th className={darkMode ? 'bg-space-cadet' : ''} style={{ width: '10%' }}>
                      #
                    </th>
                    {canAssignTeamToUsers ? (
                      <th className={darkMode ? 'bg-space-cadet' : ''} style={{ width: '100px' }}>
                        Team Name
                      </th>
                    ) : null}
                    {props.userTeamsById.length > 0 ? (
                      <th className={darkMode ? 'bg-space-cadet' : ''}></th>
                    ) : null}
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
            <div className="row">
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
                    darkMode={darkMode}
                    isMobile={true}
                    refInput={refInput}
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
