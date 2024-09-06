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
    inputAutoComplete,
    inputAutoStatus,
    isLoading,
    fetchTeamCodeAllUsers,
    darkMode,
  } = props;
  const [addTeamPopupOpen, setaddTeamPopupOpen] = useState(false);
  const [renderedOn, setRenderedOn] = useState(0);
  const [removedTeams, setRemovedTeams] = useState([]);

  useEffect(() => {
    if (saved && removedTeams.length > 0) {
      removedTeams.forEach(teamId => {
        deleteTeamMember(teamId, userProfile._id);
        setRemovedTeams([]);
      });
    }
  }, [saved,removedTeams]);

  const onAddTeamPopupShow = () => {
    setaddTeamPopupOpen(true);
  };

  const onAddTeamPopupClose = () => {
    setaddTeamPopupOpen(false);
  };
  const onSelectDeleteTeam = async (teamId) => {
    try {
      // Immediately delete the team from the backend
      await deleteTeamMember(teamId, userProfile._id);
  
      // Update the frontend state to remove the team from the user's teams
      setRemovedTeams([...removedTeams, teamId]);
      onDeleteTeam(teamId);
  
      if (isTeamSaved) isTeamSaved(false); // Mark as not saved if necessary
    } catch (error) {
      console.error("Error deleting the team:", error);
      // Optionally, add error handling or show a message to the user.
    }
  };

  const onSelectAssignTeam = team => {
    if (userProfile._id) {
      addTeamMember(team._id, userProfile._id, userProfile.firstName, userProfile.lastName);
      if (isTeamSaved) isTeamSaved(false);
    }
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
        userProfile={userProfile}
        darkMode={darkMode}
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
        inputAutoComplete={inputAutoComplete}
        inputAutoStatus={inputAutoStatus}
        isLoading={isLoading}
        fetchTeamCodeAllUsers={() => fetchTeamCodeAllUsers()}
        darkMode={darkMode}
      />
    </React.Fragment>
  );
};
export default TeamsTab;
