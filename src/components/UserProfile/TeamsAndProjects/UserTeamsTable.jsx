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

  const [teamCode, setTeamCode] = useState(
    props.userProfile ? props.userProfile.teamCode : props.teamCode,
  );

  const [isOpenModalTeamMember, setIsOpenModalTeamMember] = useState(false);

  const refInput = useRef(null);

  const arrayInputAutoComplete = useRef(props.inputAutoComplete);
  const [autoCompleteUpdateMessage, setAutoCompleteUpdateMessage] = useState(false);

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

  const handleCodeChange = async (e, autoComplete) => {
    autoComplete ? setShowDropdown(false) : null;
    const validation = autoComplete ? e : e.target.value;
    const isUpdateAutoComplete = validationUpdateAutoComplete(validation, props.inputAutoComplete);

    const regexTest = fullCodeRegex.test(validation);
    refInput.current = validation;

    if (regexTest) {
      props.setCodeValid(true);
      setTeamCode(validation);
      if (props.userProfile) {
        try {
          const url = ENDPOINTS.USERS_ALLTEAMCODE_CHANGE;
          await axios.patch(url, { userIds: props.userProfile._id, replaceCode: refInput.current });
          refInput.current.length > 0 &&
            toast.success('The code is valid, and the team code was updated!');
        if (isUpdateAutoComplete && isUpdateAutoComplete.length === 0) {
          // props.inputAutoComplete.push(refInput.current);
          // const t = props.inputAutoComplete.filter(item => item === refInput.current);
          // console.log(t);
             const newAutoComplete = await props.fetchTeamCodeAllUsers();
             toast.info('The suggestions in auto-complete were updated!');
            //  console.log(newAutoComplete);
            //  validationUpdateAutoComplete(refInput.current, newAutoComplete);
          //   // prettier-ignore
          //   setAutoCompleteUpdateMessage(false);

           }
        } catch {
          toast.error('It is not possible to save the team code.');
        }
      } else {
        props.onAssignTeamCode(validation);
      }
    } else {
      setTeamCode(validation);
      props.setCodeValid(false);
      setAutoCompleteUpdateMessage(false);
    }
    autoComplete = false;
  };

  const validationUpdateAutoComplete = (e, autoComplete) => {
    if (e !== '' && !props.isLoading) {
      const isMatchingSearch = autoComplete.filter(item =>
        filterInputAutoComplete(item).includes(filterInputAutoComplete(e)),
      );
      arrayInputAutoComplete.current = isMatchingSearch;
      //prettier-ignore
      return isMatchingSearch.filter(item => filterInputAutoComplete(item) === filterInputAutoComplete(e));
    } else arrayInputAutoComplete.current = props.inputAutoComplete;
  };
  //prettier-ignore
  useEffect(() => {arrayInputAutoComplete.current = props.inputAutoComplete}, [props.inputAutoStatus]);

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
            <Input
              id="teamCode"
              value={teamCode}
              onChange={handleCodeChange}
              style={darkMode ? colordark : styleDefault}
              placeholder="X-XXX"
              onFocus={() => !showDropdown && setShowDropdown(true)}
              disabled={!props.canEditTeamCode}
            />
          </Col>
          <div className="row" style={{ display: 'flex', flexDirection: 'column' }}>
            <AutoCompleteTeamCode
              refDropdown={refDropdown}
              teamCode={teamCode}
              showDropdown={showDropdown}
              handleCodeChange={handleCodeChange}
              setShowDropdown={setShowDropdown}
              arrayInputAutoComplete={arrayInputAutoComplete.current}
              inputAutoStatus={props.inputAutoStatus}
              isLoading={props.isLoading}
              fetchTeamCodeAllUsers={props.fetchTeamCodeAllUsers}
              darkMode={darkMode}
              isMobile={false}
              refInput={refInput}
              autoCompleteUpdateMessage={autoCompleteUpdateMessage}
            />
          </div>
        </div>
        {props.edit && props.role && (
          <Col md="12" style={{ padding: '0' }}>
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
                  <>
                    <th className={darkMode ? 'bg-space-cadet' : ''}>Members</th>
                    <th style={{ flex: 2 }} className={darkMode ? 'bg-space-cadet' : ''}>
                      {}
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
  );
};

export default connect(null, { hasPermission })(UserTeamsTable);
