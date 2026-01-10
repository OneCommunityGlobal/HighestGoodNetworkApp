import { connect } from 'react-redux';
import { get } from 'lodash';
import { getUserProfile, updateUserProfile, clearUserProfile } from '../../../actions/userProfile';

import {
  getAllUserTeams,
  updateTeam,
  deleteTeamMember,
  addTeamMember,
} from '../../../actions/allTeamsAction';

import UserProfileEdit from './UserProfileEdit';

const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: get(state, 'userProfile'),
  user: get(state, 'user', {}),
  timeEntries: state.timeEntries,
  userProjects: state.userProjects,
  allProjects: get(state, 'allProjects'),
  allTeams: state,
  role: state.role,
  state,
});

export default connect(mapStateToProps, {
  getUserProfile,
  clearUserProfile,
  updateUserProfile,
  getAllUserTeams,
  updateTeam,
  deleteTeamMember,
  addTeamMember,
})(UserProfileEdit);
