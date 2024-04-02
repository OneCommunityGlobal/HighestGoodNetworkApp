import React, { useState, useEffect } from 'react';
import AddTeamPopup from './AddTeamPopup';
import UserTeamsTable from './UserTeamsTable';
import { addTeamMember, deleteTeamMember } from 'actions/allTeamsAction';

const TeamsTab = props => {
  const {
    teamsData,
    userTeams,
    onDeleteTeam,
    onAssignTeam,
    onAssignTeamCode,
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
    codeValid,
    setCodeValid,
    saved,
    isTeamSaved,
  } = props;
  const [addTeamPopupOpen, setaddTeamPopupOpen] = useState(false);
  const [renderedOn, setRenderedOn] = useState(0);
  const [removedTeams, setRemovedTeams] = useState([]);

  useEffect(() => {
    if(saved && removedTeams.length > 0){
      removedTeams.forEach(teamId => {
        deleteTeamMember(teamId, userProfile._id);
        setRemovedTeams([]);
      })
    }
  }, [saved]);

  const onAddTeamPopupShow = () => {
    setaddTeamPopupOpen(true);
  };

  const onAddTeamPopupClose = () => {
    setaddTeamPopupOpen(false);
  };
  const onSelectDeleteTeam = teamId => {
    setRemovedTeams([...removedTeams, teamId]);
    onDeleteTeam(teamId);
    if(isTeamSaved) isTeamSaved(false);
  };

  // Remove this. Use the POST /user/:id endpoint to update the user profile rather than seperate endpoints for the team field
  // const onSelectAssignTeam = team => {
  //   if(userProfile._id){
  //     addTeamMember(team._id, userProfile._id, userProfile.firstName, userProfile.lastName);
  //     if(isTeamSaved) isTeamSaved(true);
  //   }
  //   onAssignTeam(team);
  //   setRenderedOn(Date.now());
  // };

  return (
    <React.Fragment>
      <AddTeamPopup
        open={addTeamPopupOpen}
        onClose={onAddTeamPopupClose}
        teamsData={teamsData}
        userTeamsById={userTeams}
        onSelectAssignTeam={onAssignTeam}
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
        canEditTeamCode={canEditTeamCode}
        setUserProfile={setUserProfile}
        userProfile={userProfile}
        codeValid={codeValid}
        setCodeValid={setCodeValid}
        onAssignTeamCode={onAssignTeamCode}
      />
    </React.Fragment>
  );
};
export default React.memo(TeamsTab);