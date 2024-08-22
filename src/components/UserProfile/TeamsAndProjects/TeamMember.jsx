import React, { useEffect, useState } from 'react';
import TeamMembersPopup from './../../Teams/TeamMembersPopup.jsx';
import {
  deleteTeamMember,
  addTeamMember,
  updateTeamMemeberVisibility,
} from '../../../actions/allTeamsAction.js';
import { useSelector, connect } from 'react-redux';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL.js';

export const TeamMember = props => {
  const { isOpenModalTeamMember, setIsOpenModalTeamMember, teamName, myTeamId } = props;

  const toggle = () => setIsOpenModalTeamMember(!isOpenModalTeamMember);

  const allUserProfiles = useSelector(state => state.allUserProfiles?.userProfiles || []);

  const allTeams = useSelector(state => state.allTeamsData?.allTeams || []);

  const [members, setMembers] = useState([]);

  const updateMyTeamMember = (id, newUser) => {
    setTimeout(() => {
      newUser
        ? setMembers(prev => [...prev, newUser])
        : id &&
          setMembers(prev => {
            const index = prev.findIndex(item => item._id === id);
            if (index !== -1) {
              const updatedMembers = [...prev];
              updatedMembers.splice(index, 1);
              return updatedMembers;
            }
            return prev;
          });
    }, 5000);
  };

  // prettier-ignore
  const deleteMyTeamMember = id => {deleteTeamMember(myTeamId, id); updateMyTeamMember(id)};

  const addMyTeamMember = user => {
    addTeamMember(myTeamId, user._id, user.firstName, user.lastName, user.role, Date.now());
    updateMyTeamMember(null, user);
  };
  // prettier-ignore
  useEffect(() => {myTeamId && TeamMembers();}, [myTeamId]);

  const TeamMembers = async () => {
    const url = ENDPOINTS.TEAM_USERS(myTeamId);
    try {
      const response = await axios.get(url);
      setMembers(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      {isOpenModalTeamMember && (
        <TeamMembersPopup
          open={isOpenModalTeamMember}
          onClose={toggle}
          members={members}
          onDeleteClick={deleteMyTeamMember}
          usersdata={allUserProfiles}
          onAddUser={addMyTeamMember}
          teamData={allTeams}
          onUpdateTeamMemberVisibility={updateTeamMemeberVisibility}
          selectedTeamName={teamName}
        />
      )}
    </>
  );
};

const mapStateToProps = state => ({ state });
export default connect(mapStateToProps, {
  //! getAllUserProfile,
  // ! getAllUserTeams,
  // ! postNewTeam,
  // !deleteTeam,
  //! updateTeam,
  // ! getTeamMembers,
  deleteTeamMember,
  addTeamMember,
  updateTeamMemeberVisibility,
})(TeamMember);
