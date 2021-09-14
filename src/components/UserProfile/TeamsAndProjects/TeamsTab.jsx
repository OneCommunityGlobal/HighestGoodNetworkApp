import React, { useState } from 'react';
//import { Row, Col } from 'reactstrap';
import AddTeamPopup from './AddTeamPopup';
import UserTeamsTable from './UserTeamsTable';

const TeamsTab = (props) => {
  const {
    allTeams, userTeams, isUserAdmin, onDeleteTeam, onAssignTeam, edit,
  } = props;
  const [addTeamPopupOpen, setaddTeamPopupOpen] = useState(false);
  const [renderedOn, setRenderedOn] = useState(0);

  const onAddTeamPopupShow = () => {
    setaddTeamPopupOpen(true);
  };

  const onAddTeamPopupClose = () => {
    setaddTeamPopupOpen(false);
  };
  const onSelectDeleteTeam = (teamId) => {
    onDeleteTeam(teamId)
  };

  const onSelectAssignTeam = (team) => {
    onAssignTeam(team);
    setRenderedOn(Date.now());
  };

  return (
    <React.Fragment>
      <AddTeamPopup
        open={addTeamPopupOpen}
        onClose={onAddTeamPopupClose}
        allTeams={allTeams}
        userTeamsById={userTeams}
        onSelectAssignTeam={onSelectAssignTeam}
      />
      {/* <Row>
        <Col> */}
      <UserTeamsTable
        userTeamsById={userTeams}
        onButtonClick={onAddTeamPopupShow}
        onDeleteClick={onSelectDeleteTeam}
        renderedOn={renderedOn}
        isUserAdmin={isUserAdmin}
        edit={edit}
      />
      {/* </Col>
      </Row> */}
    </React.Fragment>
  );
};
export default TeamsTab;
