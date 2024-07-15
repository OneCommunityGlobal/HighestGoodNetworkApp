import React, { useState, useEffect } from 'react';
import AddTeamPopup from './AddTeamPopup';
import UserTeamsTable from './UserTeamsTable';
import { addTeamMember, deleteTeamMember } from 'actions/allTeamsAction';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    darkMode,
  } = props;
  const [addTeamPopupOpen, setAddTeamPopupOpen] = useState(false);

  const notifySuccess = (message) => {
    toast.success(message, { position: toast.POSITION.TOP_RIGHT });
  };

  const onAddTeamPopupShow = () => {
    setAddTeamPopupOpen(true);
  };

  const onAddTeamPopupClose = () => {
    setAddTeamPopupOpen(false);
  };

  const onSelectDeleteTeam = teamId => {
    deleteTeamMember(teamId, userProfile._id);
    onDeleteTeam(teamId);
    notifySuccess('Team deleted successfully');
  };

  const onSelectAssignTeam = team => {
    addTeamMember(team._id, userProfile._id, userProfile.firstName, userProfile.lastName);
    onAssignTeam(team);
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
        darkMode={darkMode}
      />
      <UserTeamsTable
        userTeamsById={userTeams}
        onButtonClick={onAddTeamPopupShow}
        onDeleteClick={onSelectDeleteTeam}
        onUserVisibilitySwitch={onUserVisibilitySwitch}
        canEditVisibility={canEditVisibility}
        isVisible={isVisible}
        edit={edit}
        role={role}
        disabled={disabled}
        canEditTeamCode={canEditTeamCode}
        setUserProfile={setUserProfile}
        userProfile={userProfile}
        codeValid={codeValid}
        setCodeValid={setCodeValid}
        onAssignTeamCode={onAssignTeamCode}
        darkMode={darkMode}
      />
    </React.Fragment>
  );
};

export default TeamsTab;
