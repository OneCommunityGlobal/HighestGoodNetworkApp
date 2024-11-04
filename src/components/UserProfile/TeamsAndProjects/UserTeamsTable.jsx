import { React, useState, useEffect, useRef } from 'react';
import { Button, Col, Tooltip, Input } from 'reactstrap';
import './TeamsAndProjects.css';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';
import hasPermission from '../../../utils/permissions';
import styles from './UserTeamsTable.css';
import { boxStyle, boxStyleDark } from 'styles';
import { connect } from 'react-redux';
import { AutoCompleteTeamCode } from './AutoCompleteTeamCode';
import './../../Teams/Team.css';
import { TeamMember } from './TeamMember';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL.js';
import { toast } from 'react-toastify';

const UserTeamsTable = props => {
  const { darkMode } = props;

  const [tooltipOpen, setTooltip] = useState(false);

  const [teamCodeExplainTooltip, setTeamCodeExplainTooltip] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);

  const [autoComplete, setAutoComplete] = useState(false);



  const [arrayInputAutoComplete, setArrayInputAutoComplete] = useState([]);

  const [teamCode, setTeamCode] = useState(
    props.userProfile ? props.userProfile.teamCode : props.teamCode,
  );

  const [isOpenModalTeamMember, setIsOpenModalTeamMember] = useState(false);

  const [members, setMembers] = useState({
    members: [],
    TeamData: [],
    myTeamId: null,
    myTeamName: '',
  });

  const refDropdown = useRef();

  const canAssignTeamToUsers = props.hasPermission('assignTeamToUsers');
  const fullCodeRegex = /^(|([a-zA-Z0-9]-[a-zA-Z0-9]{3,5}|[a-zA-Z0-9]{5,7}|.-[a-zA-Z0-9]{3}))$/;
  const toggleTooltip = () => setTooltip(!tooltipOpen);

  useEffect(() => {
    if (props.userProfile?.teamCode) {
      setTeamCode(props.userProfile.teamCode);
    }
  }, [props.userProfile?.teamCode]);

  const handleCodeChange = (e, autoComplete) => {
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
  }, [teamCode, props.inputAutoComplete, autoComplete]);

  const filterInputAutoComplete = result => {
    return result
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '');
  };


  const styleDefault = {
    cursor: !props.canEditTeamCode ? 'not-allowed' : 'pointer',
    opacity: !props.canEditTeamCode ? 0.6 : 0.9,
  };

  const colordark = {
    backgroundColor: '#1c2541',
    color: '#fff',
    outline: 'none',
    border: 'none',
    cursor: !props.canEditTeamCode ? 'not-allowed' : 'pointer',
    opacity: !props.canEditTeamCode ? 0.6 : 0.9,
  };

  const toggleTeamCodeExplainTooltip = () => setTeamCodeExplainTooltip(!teamCodeExplainTooltip);

  const fetchTeamSelected = async (teamId, teamName, isUpdate) => {
    const urlTeamData = ENDPOINTS.TEAM_BY_ID(teamId);
    const urlTeamMembers = ENDPOINTS.TEAM_USERS(teamId);
    try {
      const TeamDataMember = await axios.get(urlTeamMembers);
      const TeamData = await axios.get(urlTeamData);

      const array = [];
      array.push(TeamData.data);

      setMembers({
        members: TeamDataMember.data,
        TeamData: array,
        myTeamId: teamId,
        myTeamName: teamName,
      });

      isUpdate ? toast.info('Team updated successfully') : setIsOpenModalTeamMember(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {innerWidth >= 1025 ? (
        <div className={`${darkMode ? 'bg-yinmn-blue' : ''}`}>
          <TeamMember
            isOpenModalTeamMember={isOpenModalTeamMember}
            setIsOpenModalTeamMember={setIsOpenModalTeamMember}
            members={members}
            fetchTeamSelected={fetchTeamSelected}
          />
          <div className="container" style={{ paddingLeft: '4px', paddingRight: '4px' }}>
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
                    <>
                      <Button
                        id="teamCodeAssign"
                        className="btn-addteam"
                        color="primary"
                        onClick={() => {
                          props.onButtonClick();
                        }}
                        style={darkMode ? {} : boxStyle}
                      >
                        Assign Team
                      </Button>
                      <Tooltip
                        placement="top" // Adjust the placement as needed
                        isOpen={teamCodeExplainTooltip}
                        target="teamCodeAssign"
                        toggle={toggleTeamCodeExplainTooltip}
                      >
                        This team code should only be used by admins/owners, and has nothing to do with the team data model.
                      </Tooltip>
                    </>
                  )}
                </Col>
              )}
              <Col md="2" style={{ padding: '0' }}>
                {props.canEditTeamCode ? (
                  <>
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
                    />
                  </>
                ) : (
                  <div id="teamCodeAssignText" style={{ fontSize: '12px', textAlign: 'center' }}>
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
                      <>
                        <th className={darkMode ? 'bg-space-cadet' : ''} style={{ width: '100px' }}>
                          Team Name
                        </th>

                        <th className={darkMode ? 'bg-space-cadet' : ''}>Members</th>
                      </>
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
                        <>
                          <td style={{ textAlign: 'center', width: '10%' }}>
                            <button
                              style={darkMode ? {} : boxStyle}
                              disabled={!canAssignTeamToUsers}
                              type="button"
                              className="btn btn-outline-info"
                              data-testid="members-btn"
                              onClick={() => fetchTeamSelected(team._id, team.teamName)}
                            >
                              <i className="fa fa-users" aria-hidden="true" />
                            </button>
                          </td>
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
                        </>
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
        <div className={`teamtable-container   ${darkMode ? 'bg-yinmn-blue' : ''}`}>
          <TeamMember
            isOpenModalTeamMember={isOpenModalTeamMember}
            setIsOpenModalTeamMember={setIsOpenModalTeamMember}
            members={members}
            fetchTeamSelected={fetchTeamSelected}
          />
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
                      />
                    ) : (
                      <div style={{ paddingTop: '6px', textAlign: 'center' }}>
                        {teamCode == '' ? 'No assigned team code' : teamCode}
                      </div>
                    )}
                  </Col>
                </div>
                {props.edit && props.role && (
                  <Col md="12" style={{ padding: '0' }}>
                    {canAssignTeamToUsers ? (
                      props.disabled ? (
                        <Button className="btn-addteam" color="primary" style={boxStyle} disabled>
                          Assign Team
                        </Button>
                      ) : (
                        <>
                          <Button
                            id="teamCodeAssign"
                            className="btn-addteam"
                            color="primary"
                            onClick={() => {
                              props.onButtonClick();
                            }}
                          >
                            Assign Team
                          </Button>
                          <Tooltip
                            placement="top" // Adjust the placement as needed
                            isOpen={teamCodeExplainTooltip}
                            target="teamCodeAssign"
                            toggle={toggleTeamCodeExplainTooltip}
                          >
                            This team code should only be used by admin/owner, and has nothing to do with
                            the team data model.
                          </Tooltip>
                        </>
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
                      <>
                        <th className={darkMode ? 'bg-space-cadet' : ''}>Members</th>
                        <th style={{ flex: 2 }} className={darkMode ? 'bg-space-cadet' : ''}>
                          { }
                        </th>
                      </>
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
                          <>
                            <td>
                              <button
                                style={darkMode ? {} : boxStyle}
                                disabled={!canAssignTeamToUsers}
                                type="button"
                                className="btn btn-outline-info"
                                data-testid="members-btn"
                                onClick={() => fetchTeamSelected(team._id, team.teamName)}
                              >
                                <i className="fa fa-users" aria-hidden="true" />
                              </button>
                            </td>

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
                          </>
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
