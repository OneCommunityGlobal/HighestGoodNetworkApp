import { React, useState, useEffect, useRef } from 'react';
import { Button, Col, Input } from 'reactstrap';
import './TeamsAndProjects.css';
import hasPermission from '../../../utils/permissions';
import styles from './UserTeamsTable.css';
import { boxStyle, boxStyleDark } from 'styles';
import { connect } from 'react-redux';
import Switch from './Switch';
import './TeamsAndProjects.css';
import './UserTeamsTable.css';

import { AutoCompleteTeamCode } from './AutoCompleteTeamCode';

import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';

import './../../Teams/Team.css';
import { TeamMember } from './TeamMember';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL.js';
import { toast } from 'react-toastify';

const UserTeamsTable = props => {
  const { darkMode } = props;


  const [showDropdown, setShowDropdown] = useState(false);

  const [autoComplete, setAutoComplete] = useState(false);

  const [arrayInputAutoComplete, setArrayInputAutoComplete] = useState(props.inputAutoComplete);

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

  const refInput = useRef(null);

  const canAssignTeamToUsers = props.hasPermission('assignTeamToUsers');
  const fullCodeRegex = /^(|([a-zA-Z0-9]-[a-zA-Z0-9]{3,5}|[a-zA-Z0-9]{5,7}|.-[a-zA-Z0-9]{3}))$/;

  useEffect(() => {
    if (props.userProfile?.teamCode) {
      setTeamCode(props.userProfile.teamCode);
    }
  }, [props.userProfile?.teamCode]);

  const handleCodeChange = async (e, autoComplete) => {
    const validation = autoComplete ? e : e.target.value;
    const isUpdateAutoComplete = validationUpdateAutoComplete(validation, props.inputAutoComplete);
    const regexTest = fullCodeRegex.test(validation);
    refInput.current = validation;
    if (regexTest) {
      props.setCodeValid(true);
      setTeamCode(validation);
      if (props.userProfile) {
        try {
          const url = ENDPOINTS.USER_PROFILE_PROPERTY(props.userProfile._id);
          await axios.patch(url, { key: 'teamCode', value: refInput.current });
          toast.success('Team code updated!');
          setTimeout(async () => {
            //prettier-ignore
            if(isUpdateAutoComplete.length === 0){
             const newAutoComplete = await props.fetchTeamCodeAllUsers();
              toast.info('Auto complete updated!')
              validationUpdateAutoComplete(refInput.current, newAutoComplete);
            }
          }, 2000);
        } catch {
          toast.error('It is not possible to save the team code.');
        }
      } else {
        props.onAssignTeamCode(validation);
      }
    } else {
      setTeamCode(validation);
      props.setCodeValid(false);
    }
    autoComplete ? setShowDropdown(false) : null;
    autoComplete = false;
  };

  const validationUpdateAutoComplete = (e, autoComplete) => {
    if (e !== '' && !props.isLoading) {
      const isMatchingSearch = autoComplete.filter(item =>
        filterInputAutoComplete(item).includes(filterInputAutoComplete(e)),
      );
      setArrayInputAutoComplete(isMatchingSearch);
      //prettier-ignore
      return isMatchingSearch.filter(item => filterInputAutoComplete(item) === filterInputAutoComplete(e));
    } else setArrayInputAutoComplete(props.inputAutoComplete);
  };
  //prettier-ignore
  useEffect(() => {setArrayInputAutoComplete(props.inputAutoComplete)}, [props.inputAutoStatus]);

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
          <div className="row">
            <Col
              md="7"
              xs="12"
              style={{
                backgroundColor: darkMode ? '#1C2541' : '#e9ecef',
                border: '1px solid #ced4da',
                marginBottom: '10px',
              }}
            >
              <span className="teams-span">Visibility</span>
            </Col>
            <Col
              md="5"
              xs="12"
              style={{
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: darkMode ? '#1C2541' : '#ffffff',
                border: darkMode ? '0px' : '1px solid #ced4da',
                marginBottom: '10px',
              }}
            >
              <ToggleSwitch

                switchType="visible"
                state={props.isVisible}
                handleUserProfile={props.onUserVisibilitySwitch}
                darkMode={darkMode}
              />
            </Col>
          </div>
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
          <div className="row" style={{ display: 'flex', flexDirection: 'column' }} >
            <AutoCompleteTeamCode
              refDropdown={refDropdown}
              showDropdown={showDropdown}
              handleCodeChange={handleCodeChange}
              setShowDropdown={setShowDropdown}
              arrayInputAutoComplete={arrayInputAutoComplete}
              inputAutoStatus={props.inputAutoStatus}
              isLoading={props.isLoading}
              fetchTeamCodeAllUsers={props.fetchTeamCodeAllUsers}
              darkMode={darkMode}
            />
          </div>
        </div>
        {props.edit && props.role && (
          <Col md="12" style={{ padding: '0' }}>
            {canAssignTeamToUsers ? (
              props.disabled ? (

                <Button id="teamCodeAssign" className="btn-addteam" color="primary" style={boxStyle} disabled>
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
      </Col>
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
