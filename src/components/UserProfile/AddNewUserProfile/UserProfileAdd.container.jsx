import { connect } from 'react-redux';
import { get } from 'lodash';
import { getUserProfile, clearUserProfile } from '../../../actions/userProfile';

import {
  // getAllUserTeams,
  updateTeam,
  deleteTeamMember,
  addTeamMember,
} from '../../../actions/allTeamsAction';

import { fetchAllProjects } from 'actions/projects';

import AddUserProfile from './UserProfileAdd';

const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: get(state, 'userProfile'),
  user: get(state, 'user', {}),
  timeEntries: state.timeEntries,
  userProjects: state.userProjects,
  allProjects: get(state, 'allProjects'),
  allTeams: state,
  state,
});

export default connect(mapStateToProps, {
  getUserProfile,
  clearUserProfile,
  // getAllUserTeams,
  updateTeam,
  deleteTeamMember,
  addTeamMember,
  fetchAllProjects,
})(AddUserProfile);
