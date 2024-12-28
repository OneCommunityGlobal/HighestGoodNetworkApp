import React from 'react';
import { useSelector, connect } from 'react-redux';
import TeamMembersPopup from '../../Teams/TeamMembersPopup.jsx';
import {
  deleteTeamMember,
  addTeamMember,
  updateTeamMemeberVisibility,
} from '../../../actions/allTeamsAction.js';

export function TeamMember(props) {
  const { isOpenModalTeamMember, setIsOpenModalTeamMember, members, fetchTeamSelected } = props;

  const toggle = () => setIsOpenModalTeamMember(!isOpenModalTeamMember);

  const allUserProfiles = useSelector(state => state.allUserProfiles?.userProfiles || []);

  const updateMyTeamMember = () => {
    setTimeout(() => {
      fetchTeamSelected(members.myTeamId, members.myTeamName, true);
    }, 3000);
  };

  // prettier-ignore
  const deleteMyTeamMember = id => {deleteTeamMember(members.myTeamId, id); updateMyTeamMember()};

  const addMyTeamMember = user => {
    addTeamMember(members.myTeamId, user._id, user.firstName, user.lastName, user.role, Date.now());
    updateMyTeamMember();
  };

  const updateTeamMemberVisibility = (userId, visibility) => {
    updateTeamMemeberVisibility(members.myTeamId, userId, visibility);
    updateMyTeamMember();
  };

  return (
    <>
      {isOpenModalTeamMember && (
        <TeamMembersPopup
          open={isOpenModalTeamMember}
          onClose={toggle}
          members={members.members}
          onDeleteClick={deleteMyTeamMember}
          usersdata={allUserProfiles}
          onAddUser={addMyTeamMember}
          teamData={members.TeamData}
          onUpdateTeamMemberVisibility={updateTeamMemberVisibility}
          selectedTeamName={members.myTeamName}
        />
      )}
    </>
  );
}

const mapStateToProps = state => ({ state });
export default connect(mapStateToProps, {
  deleteTeamMember,
  addTeamMember,
  updateTeamMemeberVisibility,
})(TeamMember);
