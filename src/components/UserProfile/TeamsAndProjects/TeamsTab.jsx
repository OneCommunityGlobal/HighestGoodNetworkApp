import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addTeamMember, deleteTeamMember } from '~/actions/allTeamsAction';
import { toast } from 'react-toastify';
import AddTeamPopup from './AddTeamPopup';
import UserTeamsTable from './UserTeamsTable';
import PropTypes from 'prop-types';

function TeamsTab(props) {
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
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof fetchTeamCodeAllUsers === 'function') {
      fetchTeamCodeAllUsers();
    }
  }, []);

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

  const onSelectDeleteTeam = async teamId => {
    try {
      if (userProfile._id) {
        await dispatch(deleteTeamMember(teamId, userProfile._id));
      }
      setUserProfile(prev => ({
      ...prev,
      teams: prev.teams.filter(t => t._id !== teamId),
    }));
      toast.success('Team Deleted successfully');
      onDeleteTeam(teamId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    }
  };

  const onSelectAssignTeam = async team => {
    try {
      if (userProfile?._id) {
        await dispatch(addTeamMember(team._id, userProfile._id, userProfile.firstName, userProfile.lastName));
      }
      const updatedTeams = [...(userProfile?.teams || []), team];

      if (setUserProfile) {
      setUserProfile(prev => ({
        ...prev,
        teams: updatedTeams,
        }));
      }
      onAssignTeam(team);
      if (typeof handleSubmit === 'function') {
        await handleSubmit({
          ...userProfile,
          teams: updatedTeams.map(t => t._id || t),
        });
      }

      toast.success('Team assigned successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error assigning team:', error);
      toast.error('Failed to assign team');
    }
  };

  return (
    <>
      <AddTeamPopup
        data-testid="add-team-popup"
        open={addTeamPopupOpen}
        onClose={onAddTeamPopupClose}
        teamsData={teamsData}
        userTeamsById={userTeams}
        onSelectAssignTeam={onSelectAssignTeam}
        handleSubmit={handleSubmit}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        darkMode={darkMode}
      />
      <UserTeamsTable
        data-testid="user-teams-table"
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
    </>
  );
}

TeamsTab.propTypes = {
  userProfile: PropTypes.shape({
    _id: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    teams: PropTypes.arrayOf(PropTypes.object),
  }),
};

export default TeamsTab;
