import { useState, useEffect, useRef } from 'react';
import { Button, Col, Input } from 'reactstrap';
import './TeamsAndProjects.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { connect } from 'react-redux';
import { boxStyle } from '../../../styles';
import hasPermission from '../../../utils/permissions';
import './TeamsAndProjects.css';
import './UserTeamsTable.css';

import { AutoCompleteTeamCode } from './AutoCompleteTeamCode';

import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';

import '../../Teams/Team.css';
import { TeamMember } from './TeamMember';
import { ENDPOINTS } from '../../../utils/URL';

function UserTeamsTable(props) {
  const { darkMode } = props;

  const [showDropdown, setShowDropdown] = useState(false);

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

  const filterInputAutoComplete = result =>
    result
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '');

  const validationUpdateAutoComplete = (value, inputArray) => {
    if (value !== '' && !props.isLoading) {
      const matchingSearch = inputArray.filter(item =>
        filterInputAutoComplete(item).includes(filterInputAutoComplete(value)),
      );
      setArrayInputAutoComplete(matchingSearch);
      return matchingSearch.filter(
        item => filterInputAutoComplete(item) === filterInputAutoComplete(value),
      );
    }
    setArrayInputAutoComplete(props.inputAutoComplete);
    return null;
  };

  const handleCodeChange = async (e, isAutoComplete) => {
    const validation = isAutoComplete ? e : e.target.value;
    setTeamCode(validation);

    if (validation !== '') {
      const regexTest = fullCodeRegex.test(validation);
      refInput.current = validation;

      if (regexTest) {
        props.setCodeValid(true);

        if (props.userProfile) {
          try {
            const url = ENDPOINTS.USER_PROFILE_PROPERTY(props.userProfile._id);
            await axios.patch(url, { key: 'teamCode', value: refInput.current });
            toast.success('Team code updated!');
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

      if (isAutoComplete) {
        setShowDropdown(false);
      }
    }

    validationUpdateAutoComplete(validation, props.inputAutoComplete);
  };

  useEffect(() => {
    setArrayInputAutoComplete(props.inputAutoComplete);
  }, [props.inputAutoStatus]);

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

      if (isUpdate) {
        toast.info('Team updated successfully');
      } else {
        setIsOpenModalTeamMember(true);
      }
    } catch (error) {
      toast.error(error);
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
          <div className="row" style={{ display: 'flex', flexDirection: 'column' }}>
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
            {canAssignTeamToUsers && (
              <Button
                id="teamCodeAssign"
                className="btn-addteam"
                color="primary"
                style={props.disabled ? boxStyle : undefined}
                onClick={!props.disabled ? props.onButtonClick : undefined}
                disabled={props.disabled}
              >
                Assign Team
              </Button>
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
            {props.userTeamsById.length > 0 &&
              props.userTeamsById.map((team, index) => (
                <tr key={team._id} className={`tr ${darkMode ? 'dark-mode' : ''}`}>
                  <td>{index + 1}</td>
                  <td>{team.teamName}</td>
                  {props.edit && props.role && (
                    <>
                      <td
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      >
                        <button
                          aria-label="Assign team to users"
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
                            onClick={() => props.onDeleteClick(team._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default connect(null, { hasPermission })(UserTeamsTable);
