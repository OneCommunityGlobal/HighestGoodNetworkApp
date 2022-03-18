import { connect } from 'react-redux';
import _ from 'lodash';
import { getUserProfile, updateUserProfile, clearUserProfile } from '../../../actions/userProfile';

import {
  getAllUserTeams,
  updateTeam,
  deleteTeamMember,
  addTeamMember,
} from '../../../actions/allTeamsAction';

import UserProfileEdit from './UserProfileEdit';

const mapStateToProps = (state) => ({
  auth: state.auth,
  userProfile: _.get(state, 'userProfile'),
  user: _.get(state, 'user', {}),
  timeEntries: state.timeEntries,
  userProjects: state.userProjects,
  allProjects: _.get(state, 'allProjects'),
  allTeams: state,
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
