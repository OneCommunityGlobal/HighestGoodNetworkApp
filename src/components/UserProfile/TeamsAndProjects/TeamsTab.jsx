import React, { useState } from 'react';
import { Row, Label, Input, Col, FormGroup } from 'reactstrap';
import AddTeamPopup from './AddTeamPopup';
import UserTeamsTable from './UserTeamsTable';

const TeamsTab = props => {
  const {
    teamsData,
    userTeams,
    onDeleteTeam,
    onAssignTeam,
    edit,
    role,
    onUserVisibilitySwitch,
    isVisible,
    canEditVisibility,
    handleSubmit,
    disabled,
    canEditTeamCode,
    setUserProfile,
    userProfile,
  } = props;
  const [addTeamPopupOpen, setaddTeamPopupOpen] = useState(false);
  const [renderedOn, setRenderedOn] = useState(0);

  const onAddTeamPopupShow = () => {
    setaddTeamPopupOpen(true);
  };

  const onAddTeamPopupClose = () => {
    setaddTeamPopupOpen(false);
  };
  const onSelectDeleteTeam = teamId => {
    onDeleteTeam(teamId);
  };

  const onSelectAssignTeam = team => {
    onAssignTeam(team);
    setRenderedOn(Date.now());
  };

  return (
    <React.Fragment>
      <AddTeamPopup
        open={addTeamPopupOpen}
        onClose={onAddTeamPopupClose}
        teamsData={teamsData}
        userTeamsById={userTeams}
        onSelectAssignTeam={onSelectAssignTeam}
        handleSubmit={handleSubmit}
      />
      <UserTeamsTable
        userTeamsById={userTeams}
        onButtonClick={onAddTeamPopupShow}
        onDeleteClick={onSelectDeleteTeam}
        onUserVisibilitySwitch={onUserVisibilitySwitch}
        canEditVisibility={canEditVisibility}
        isVisible={isVisible}
        renderedOn={renderedOn}
        edit={edit}
        role={role}
        disabled={disabled}
      />
      <Row>
        <Col>
          <Label>Team Code</Label>
        </Col>
        <Col>
          {canEditTeamCode ? (
            <FormGroup disabled={!canEditTeamCode}>
              <Input
                type="text"
                name="teamCode"
                id="teamCode"
                value={userProfile.teamCode}
                onChange={e => {
                  setUserProfile({ ...userProfile, teamCode: e.target.value });
                }}
                placeholder="format: A-AAA"
              />
            </FormGroup>
          ) : (
            `${userProfile.teamCodes || userProfile.teamCode == ''
              ? "No assigned team code": userProfile.teamCode}`
          )}
        </Col>
      </Row>
    </React.Fragment>
  );
};
export default TeamsTab;
