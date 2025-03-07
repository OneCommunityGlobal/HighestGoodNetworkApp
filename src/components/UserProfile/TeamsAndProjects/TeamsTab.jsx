import React, { useState, useEffect } from 'react';
import AddTeamPopup from './AddTeamPopup';
import UserTeamsTable from './UserTeamsTable';
import { addTeamMember, deleteTeamMember } from 'actions/allTeamsAction';
import { toast } from 'react-toastify';
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
  }, [saved]);

  const onAddTeamPopupShow = () => {
    setaddTeamPopupOpen(true);
  };

  const onAddTeamPopupClose = () => {
    setaddTeamPopupOpen(false);
  };
  
  const onSelectDeleteTeam =  teamId => {
    try {
      if (userProfile._id) {
        deleteTeamMember(teamId, userProfile._id);
      }
      toast.success('Team Deleted successfully');
      onDeleteTeam(teamId);
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    }
  };
  

  const onSelectAssignTeam =  team => {
    try {
      if (userProfile?._id) {
        addTeamMember(team._id, userProfile._id, userProfile.firstName, userProfile.lastName);
      }
      onAssignTeam(team);
      toast.success('Team assigned successfully');
    } catch (error) {
      console.error('Error assigning team:', error);
      toast.error('Failed to assign team');
    }
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